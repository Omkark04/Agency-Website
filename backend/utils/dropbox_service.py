# utils/dropbox_service.py
"""
Dropbox service for uploading and managing PDF files
"""
import os
from io import BytesIO
import dropbox
from dropbox.files import WriteMode
from dropbox.exceptions import ApiError, AuthError


class DropboxService:
    """Service class for Dropbox operations"""
    
    def __init__(self):
        """Initialize Dropbox service"""
        self.dbx = None
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the Dropbox API client"""
        try:
            # Get credentials from environment variables
            access_token = os.getenv('DROPBOX_ACCESS_TOKEN')
            refresh_token = os.getenv('DROPBOX_REFRESH_TOKEN')
            app_key = os.getenv('DROPBOX_APP_KEY')
            app_secret = os.getenv('DROPBOX_APP_SECRET')
            
            # Debug logging
            print(f"DEBUG: Initializing Dropbox Service")
            print(f"DEBUG: ACCESS_TOKEN present: {bool(access_token)}")
            print(f"DEBUG: REFRESH_TOKEN present: {bool(refresh_token)}")
            print(f"DEBUG: APP_KEY present: {bool(app_key)}")
            print(f"DEBUG: APP_SECRET present: {bool(app_secret)}")
            
            if refresh_token and app_key and app_secret:
                print("DEBUG: Using Refresh Token Flow")
                # Initialize with refresh token for automatic refreshing
                self.dbx = dropbox.Dropbox(
                    oauth2_refresh_token=refresh_token,
                    app_key=app_key,
                    app_secret=app_secret,
                    oauth2_access_token=access_token  # Optional: use existing access token until it expires
                )
            elif access_token:
                print("DEBUG: Using Access Token Flow (No Refresh Token)")
                # Initialize with access token only (will expire)
                self.dbx = dropbox.Dropbox(access_token)
            else:
                print("DEBUG: No credentials found")
                raise ValueError("Dropbox credentials not found. Provide DROPBOX_ACCESS_TOKEN or (DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY, DROPBOX_APP_SECRET)")
            
            # Verify the token works (or can be refreshed)
            try:
                self.dbx.users_get_current_account()
                print("DEBUG: Dropbox connection verified successfully")
            except AuthError as e:
                print(f"DEBUG: Dropout Auth Error: {e}")
                # If using only access token and it's expired, this will fail
                # If using refresh token, it should have auto-refreshed by now
                raise Exception(f"Invalid Dropbox credentials or expired token: {str(e)}")
            
        except Exception as e:
            print(f"DEBUG: Dropbox Initialization Failed: {e}")
            raise Exception(f"Failed to initialize Dropbox service: {str(e)}")
    
    def upload_pdf(self, pdf_file, filename, folder_path="/PDFs"):
        """
        Upload a PDF file to Dropbox
        
        Args:
            pdf_file: BytesIO object or file-like object containing PDF data
            filename: Name for the file
            folder_path: Folder path in Dropbox (default: /PDFs)
            
        Returns:
            dict: {'file_path': str, 'download_url': str, 'shared_link': str}
        """
        try:
            # Ensure we're at the start of the file
            pdf_file.seek(0)
            pdf_content = pdf_file.read()
            
            # Construct full path
            full_path = f"{folder_path}/{filename}"
            
            # Upload file to Dropbox
            # mode=WriteMode.overwrite allows replacing existing files
            self.dbx.files_upload(
                pdf_content,
                full_path,
                mode=WriteMode.overwrite,
                autorename=False
            )
            
            # Create a shared link for the file
            try:
                # Try to get existing shared link
                shared_links = self.dbx.sharing_list_shared_links(path=full_path)
                if shared_links.links:
                    shared_link = shared_links.links[0].url
                else:
                    # Create new shared link
                    link_metadata = self.dbx.sharing_create_shared_link_with_settings(full_path)
                    shared_link = link_metadata.url
            except ApiError as e:
                # If link already exists, get it
                if hasattr(e.error, 'shared_link_already_exists'):
                    shared_links = self.dbx.sharing_list_shared_links(path=full_path)
                    shared_link = shared_links.links[0].url if shared_links.links else None
                else:
                    shared_link = None
            
            
            # Convert shared link to direct download link
            # Change dl=0 to dl=1 for direct download (handles any position in URL)
            if shared_link:
                if 'dl=0' in shared_link:
                    download_url = shared_link.replace('dl=0', 'dl=1')
                elif 'dl=1' not in shared_link:
                    # Add dl=1 if not present
                    separator = '&' if '?' in shared_link else '?'
                    download_url = f"{shared_link}{separator}dl=1"
                else:
                    download_url = shared_link
            else:
                download_url = None
            
            return {
                'file_path': full_path,
                'download_url': download_url,
                'shared_link': shared_link,
                'filename': filename
            }
            
        except Exception as e:
            raise Exception(f"Failed to upload PDF to Dropbox: {str(e)}")
    
    def delete_file(self, file_path):
        """Delete a file from Dropbox"""
        try:
            self.dbx.files_delete_v2(file_path)
            return True
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
            return False
    
    def get_file_info(self, file_path):
        """Get information about a file"""
        try:
            metadata = self.dbx.files_get_metadata(file_path)
            return {
                'name': metadata.name,
                'path': metadata.path_display,
                'size': metadata.size if hasattr(metadata, 'size') else None,
                'modified': metadata.client_modified if hasattr(metadata, 'client_modified') else None
            }
        except Exception as e:
            print(f"Error getting file info: {str(e)}")
            return None
    
    def list_files_in_folder(self, folder_path="/PDFs"):
        """List files in a specific folder"""
        try:
            result = self.dbx.files_list_folder(folder_path)
            files = []
            
            for entry in result.entries:
                if isinstance(entry, dropbox.files.FileMetadata):
                    files.append({
                        'name': entry.name,
                        'path': entry.path_display,
                        'size': entry.size,
                        'modified': entry.client_modified
                    })
            
            return files
            
        except Exception as e:
            print(f"Error listing files: {str(e)}")
            return []


# Singleton instance
_dropbox_service = None

def get_dropbox_service():
    """Get or create Dropbox service instance"""
    global _dropbox_service
    
    if _dropbox_service is None:
        _dropbox_service = DropboxService()
    
    return _dropbox_service
