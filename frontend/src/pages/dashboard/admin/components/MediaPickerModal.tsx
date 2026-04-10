import { useEffect, useState } from 'react';
import { listMedia, type MediaItem } from '../../../../api/media';
import Modal from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { 
  FiSearch, 
  FiImage, 
  FiVideo, 
  FiCheck, 
  FiX,
  FiRefreshCw
} from 'react-icons/fi';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  title?: string;
  mediaType?: 'image' | 'video' | 'all';
}

export default function MediaPickerModal({ 
  open, 
  onClose, 
  onSelect, 
  title = "Select Media",
  mediaType = 'all'
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>(mediaType);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'all') params.media_type = typeFilter;
      const res = await listMedia(params);
      setMedia(res.data);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open, typeFilter]);

  const filteredMedia = media.filter(item => 
    item.file_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.caption?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="media-picker">
        <div className="media-picker__filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="media-picker__search" style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search filename or caption..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                outline: 'none'
              }}
            />
          </div>
          <div className="media-picker__types" style={{ display: 'flex', gap: '0.5rem' }}>
            <Button 
              size="sm" 
              variant={typeFilter === 'all' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('all')}
            >All</Button>
            <Button 
              size="sm" 
              variant={typeFilter === 'image' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('image')}
            ><FiImage style={{ marginRight: '0.25rem' }} /> Image</Button>
            <Button 
              size="sm" 
              variant={typeFilter === 'video' ? 'primary' : 'outline'}
              onClick={() => setTypeFilter('video')}
            ><FiVideo style={{ marginRight: '0.25rem' }} /> Video</Button>
          </div>
          <button 
            onClick={loadMedia}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="media-picker__grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '1rem',
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '0.25rem'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>Loading media...</div>
          ) : filteredMedia.length > 0 ? (
            filteredMedia.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                style={{ 
                  cursor: 'pointer',
                  borderRadius: '0.75rem',
                  border: '2px solid #f3f4f6',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                className="group hover:border-[#00BCD4] hover:shadow-md"
              >
                <div style={{ height: '100px', background: '#f9fafb', position: 'relative' }}>
                  {item.media_type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1F44' }}>
                      <FiVideo style={{ margin: 'auto', fontSize: '2rem', color: 'white' }} />
                    </div>
                  ) : (
                    <img 
                      src={item.url} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  {item.media_type === 'video' && (
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px' }}>Video</div>
                  )}
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0' }} title={item.file_name}>
                    {item.file_name}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.25rem' }}>
                    {item.caption || 'No caption'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              No media found
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
