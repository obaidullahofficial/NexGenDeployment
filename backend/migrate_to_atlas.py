"""
MongoDB Local to Atlas Migration Script
Exports data from local MongoDB and imports it to MongoDB Atlas
"""

import pymongo
from pymongo import MongoClient
import json
from datetime import datetime
import sys
import time

# Configuration
LOCAL_MONGO_URI = "mongodb://localhost:27017/"
ATLAS_MONGO_URI = "mongodb+srv://AashfaNoor:NextGenIT22-A@cluster0.otiywgx.mongodb.net/?retryWrites=true&w=majority"
LOCAL_DB_NAME = "NextGenArchitect"
ATLAS_DB_NAME = "NextGenArchitect"

# Collections to migrate
COLLECTIONS_TO_MIGRATE = [
    'users',
    'plots',
    'society_profiles',
    'approval_requests',
    'compliance_rules',
    'floorplans',
    'advertisements',
    'advertisement_plans',
    'reviews',
    'subscriptions',
    'templates',
    'email_verifications',
]

class MongoMigrator:
    def __init__(self):
        self.local_client = None
        self.atlas_client = None
        self.local_db = None
        self.atlas_db = None
        self.migration_stats = {
            'collections': 0,
            'documents': 0,
            'errors': 0,
            'start_time': None,
            'end_time': None
        }
    
    def connect_local(self):
        """Connect to local MongoDB"""
        try:
            print(f"\n🔄 Connecting to local MongoDB: {LOCAL_MONGO_URI}")
            self.local_client = MongoClient(LOCAL_MONGO_URI, serverSelectionTimeoutMS=5000)
            self.local_client.admin.command('ping')
            self.local_db = self.local_client[LOCAL_DB_NAME]
            print(f"✅ Connected to local MongoDB database: {LOCAL_DB_NAME}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to local MongoDB: {e}")
            print("   Make sure MongoDB is running locally on port 27017")
            return False
    
    def connect_atlas(self):
        """Connect to MongoDB Atlas"""
        try:
            print(f"\n🔄 Connecting to MongoDB Atlas...")
            self.atlas_client = MongoClient(ATLAS_MONGO_URI, serverSelectionTimeoutMS=5000)
            self.atlas_client.admin.command('ping')
            self.atlas_db = self.atlas_client[ATLAS_DB_NAME]
            print(f"✅ Connected to MongoDB Atlas database: {ATLAS_DB_NAME}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB Atlas: {e}")
            print("   Check your connection string and network settings")
            return False
    
    def get_collections(self):
        """Get list of collections from local database"""
        try:
            collections = self.local_db.list_collection_names()
            print(f"\n📊 Collections in local database: {len(collections)}")
            for col in collections:
                count = self.local_db[col].count_documents({})
                print(f"   • {col}: {count} documents")
            return collections
        except Exception as e:
            print(f"❌ Error listing collections: {e}")
            return []
    
    def migrate_collection(self, collection_name):
        """Migrate a single collection from local to Atlas"""
        try:
            local_col = self.local_db[collection_name]
            atlas_col = self.atlas_db[collection_name]
            
            # Get all documents from local collection
            documents = list(local_col.find({}))
            
            if not documents:
                print(f"   ⚠️  {collection_name}: No documents to migrate")
                return True, 0
            
            # Clear existing documents in Atlas (optional - comment if you want to keep them)
            # atlas_col.delete_many({})
            
            # Insert documents into Atlas
            result = atlas_col.insert_many(documents, ordered=False)
            
            inserted_count = len(result.inserted_ids)
            print(f"   ✅ {collection_name}: {inserted_count} documents migrated")
            
            return True, inserted_count
            
        except pymongo.errors.BulkWriteError as e:
            # Some documents might have been inserted before the error
            print(f"   ⚠️  {collection_name}: Partial insert - {e.details['nInserted']} documents inserted")
            return True, e.details.get('nInserted', 0)
        except Exception as e:
            print(f"   ❌ {collection_name}: Migration failed - {e}")
            self.migration_stats['errors'] += 1
            return False, 0
    
    def migrate_all(self):
        """Migrate all collections"""
        print("\n" + "="*60)
        print("🚀 STARTING MIGRATION: Local MongoDB → MongoDB Atlas")
        print("="*60)
        
        self.migration_stats['start_time'] = datetime.now()
        
        # Connect to both databases
        if not self.connect_local():
            return False
        
        if not self.connect_atlas():
            return False
        
        # Show collections in local database
        collections = self.get_collections()
        
        # Migrate specific collections
        print(f"\n🔄 Migrating {len(COLLECTIONS_TO_MIGRATE)} collections...")
        print("-" * 60)
        
        for collection_name in COLLECTIONS_TO_MIGRATE:
            if collection_name in collections:
                success, doc_count = self.migrate_collection(collection_name)
                if success:
                    self.migration_stats['collections'] += 1
                    self.migration_stats['documents'] += doc_count
            else:
                print(f"   ⏭️  {collection_name}: Not found in local database (skipping)")
        
        self.migration_stats['end_time'] = datetime.now()
        
        # Print summary
        self.print_summary()
        
        # Close connections
        self.close_connections()
        
        return self.migration_stats['errors'] == 0
    
    def print_summary(self):
        """Print migration summary"""
        duration = (self.migration_stats['end_time'] - self.migration_stats['start_time']).total_seconds()
        
        print("\n" + "="*60)
        print("📊 MIGRATION SUMMARY")
        print("="*60)
        print(f"Collections migrated: {self.migration_stats['collections']}")
        print(f"Total documents: {self.migration_stats['documents']}")
        print(f"Errors: {self.migration_stats['errors']}")
        print(f"Duration: {duration:.2f} seconds")
        print("="*60)
        
        if self.migration_stats['errors'] == 0:
            print("✅ Migration completed successfully!")
        else:
            print(f"⚠️  Migration completed with {self.migration_stats['errors']} error(s)")
    
    def close_connections(self):
        """Close database connections"""
        if self.local_client:
            self.local_client.close()
        if self.atlas_client:
            self.atlas_client.close()
        print("\n🔌 Connections closed")
    
    def verify_migration(self):
        """Verify that data was migrated correctly"""
        print("\n" + "="*60)
        print("🔍 VERIFYING MIGRATION")
        print("="*60)
        
        for collection_name in COLLECTIONS_TO_MIGRATE:
            try:
                local_count = self.local_db[collection_name].count_documents({})
                atlas_count = self.atlas_db[collection_name].count_documents({})
                
                status = "✅" if local_count == atlas_count else "⚠️"
                print(f"{status} {collection_name}: Local={local_count}, Atlas={atlas_count}")
                
            except Exception as e:
                print(f"❌ {collection_name}: Verification failed - {e}")
        
        print("="*60)

def main():
    """Main migration function"""
    migrator = MongoMigrator()
    
    # Run migration
    success = migrator.migrate_all()
    
    # Verify migration
    if success:
        time.sleep(2)  # Wait for write acknowledgment
        migrator.verify_migration()
        migrator.close_connections()
        print("\n✅ All done! Your data is now in MongoDB Atlas.")
        return 0
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        migrator.close_connections()
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
