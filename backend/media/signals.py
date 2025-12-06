from django.db.models.signals import post_delete
from django.dispatch import receiver
import cloudinary.uploader
from .models import Media

@receiver(post_delete, sender=Media)
def delete_media_files(sender, instance, **kwargs):
    if instance.url:
        public_id = instance.url.split("/")[-1].split(".")[0]
        cloudinary.uploader.destroy(public_id)
