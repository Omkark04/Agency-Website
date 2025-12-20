# management/commands/export_data_utf8.py
from django.core.management.base import BaseCommand
from django.core import serializers
from django.apps import apps
import json


class Command(BaseCommand):
    help = 'Export data with UTF-8 encoding'

    def handle(self, *args, **options):
        # Get all models except contenttypes and permissions
        all_models = []
        for app_config in apps.get_app_configs():
            if app_config.label not in ['contenttypes', 'auth']:
                all_models.extend(app_config.get_models())
            elif app_config.label == 'auth':
                # Include auth models except Permission
                for model in app_config.get_models():
                    if model.__name__ != 'Permission':
                        all_models.append(model)
        
        # Serialize data
        data = []
        for model in all_models:
            self.stdout.write(f'Exporting {model.__name__}...')
            objects = model.objects.all()
            serialized = serializers.serialize(
                'json',
                objects,
                use_natural_foreign_keys=True,
                use_natural_primary_keys=True
            )
            data.extend(json.loads(serialized))
        
        # Write to file with UTF-8 encoding
        with open('data_backup.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully exported {len(data)} objects'))
