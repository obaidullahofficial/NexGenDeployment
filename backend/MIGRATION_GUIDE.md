# MongoDB Atlas to Local Migration Guide

## Prerequisites

Before running the migration, ensure:
1. **MongoDB is installed locally** on your machine
2. **MongoDB service is running**
3. **Python environment has pymongo** (already in your requirements.txt)

---

## Step 1: Install MongoDB Locally

### Option A: Using Chocolatey (Windows)
```powershell
choco install mongodb-community
```

### Option B: Download Installer
Visit: https://www.mongodb.com/try/download/community
- Download the Windows installer
- Run the installer with default options
- MongoDB will be installed and registered as a service

### Option C: Portable (No Installation)
Download the zip file and extract it to a local folder, then run `mongod.exe` manually.

---

## Step 2: Start MongoDB Service

### Option A: Start as Service (Recommended)
```powershell
net start MongoDB
```

### Option B: Run Manually
```powershell
mongod
```
You should see: `waiting for connections on port 27017`

### Troubleshooting
If you get "The service cannot be started", run:
```powershell
# Stop the service first (if running)
net stop MongoDB

# Start it again
net start MongoDB
```

---

## Step 3: Run the Migration Script

Navigate to your backend folder and run the migration:

```powershell
cd backend

# Run the migration script
python migrate_to_local.py
```

This will:
1. ✓ Connect to MongoDB Atlas
2. ✓ Export all your data
3. ✓ Connect to Local MongoDB
4. ✓ Import all data
5. ✓ Verify the migration
6. ✓ Save backup JSON files

---

## Step 4: Verify Migration Worked

### Option A: Check via Python (Quick)
```powershell
python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['NextGenArchitect']
collections = db.list_collection_names()
for col in collections:
    count = db[col].count_documents({})
    print(f'{col}: {count} documents')
"
```

### Option B: Use MongoDB Compass (GUI)
1. Download: https://www.mongodb.com/products/tools/compass
2. Connect to: `mongodb://localhost:27017/`
3. Browse the `NextGenArchitect` database

### Option C: Use MongoDB Shell
```powershell
# Connect to local MongoDB
mongosh

# In the MongoDB shell:
use NextGenArchitect
db.getCollectionNames()
db.users.countDocuments()  # Check any collection
```

---

## Step 5: Configure Your App

Your [backend/utils/db.py](../utils/db.py) is already configured to:
1. Try **Local MongoDB first** (for development speed)
2. Fall back to **MongoDB Atlas** if local is unavailable

No additional configuration needed! ✓

---

## Step 6: Run Your App

```powershell
cd backend
python app.py
```

You should see in the console:
```
[DB] Attempting to connect to local MongoDB...
[DB] ✅ Connected to local MongoDB (with connection pooling)
```

---

## Troubleshooting

### "Failed to connect to Local MongoDB"
- **Check if MongoDB is running**: `net start MongoDB`
- **Check port 27017 is free**: `netstat -ano | findstr :27017`
- **Try manual start**: `mongod` in a separate terminal

### "Failed to connect to MongoDB Atlas"
- Check your internet connection
- Verify the connection string in [db.py](../utils/db.py)
- Check if your IP is whitelisted in Atlas (Network Access)

### "Migration shows 0 documents"
- Verify your Atlas connection string is correct
- Check that there's actually data in your Atlas database
- Try viewing Atlas through MongoDB Compass

### Performance is slow
- First migration might take time if you have lots of data
- Subsequent runs will be faster
- Check your network speed to Atlas

---

## Backing Up Your Data

Before migration, backup files are automatically saved to `./db_backup/` directory with timestamps:
```
db_backup/
  ├── users_20260319_143022.json
  ├── society_profiles_20260319_143022.json
  └── ... (other collections)
```

These are pure JSON files - you can restore them manually if needed.

---

## Switching Back to Atlas (If Needed)

If you want to use Atlas again, simply:
1. Stop local MongoDB: `net stop MongoDB`
2. The app will automatically fall back to Atlas

Or edit [db.py](../utils/db.py) to reverse the priority order.

---

## Next Steps

✅ Migration complete
- All data is now on your local machine
- Your app is using local MongoDB first
- Backup files saved in `db_backup/` directory
- You can now work offline without Atlas costs!

