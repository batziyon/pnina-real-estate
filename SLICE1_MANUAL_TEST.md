# Slice 1 Manual Testing Guide

This document describes how to manually test the storage foundation implemented in Slice 1.

## Prerequisites

1. Set `BLOB_READ_WRITE_TOKEN` in your `.env` file
2. Ensure database migration has been applied
3. Build passes successfully

## Test 1: Storage Key Generation

Test the utility functions for generating and validating storage keys.

### Node REPL Test

```bash
node
```

```javascript
const { 
  generateImageStorageKey, 
  parseImageStorageKey, 
  validateImageStorageKey,
  extractExtension 
} = require('./src/application/ports/storage/storage-key.utils.ts');

// Test 1: Generate storage key
const key = generateImageStorageKey('prop123', 'img456', 'jpg');
console.log('Generated key:', key);
// Expected: "properties/prop123/images/img456.jpg"

// Test 2: Parse storage key
const parsed = parseImageStorageKey(key);
console.log('Parsed:', parsed);
// Expected: { propertyId: 'prop123', imageId: 'img456', extension: 'jpg' }

// Test 3: Validate storage key
const valid = validateImageStorageKey(key, 'prop123', 'img456');
console.log('Valid:', valid);
// Expected: true

// Test 4: Extract extension from filename
const ext = extractExtension('photo.JPG');
console.log('Extension:', ext);
// Expected: "jpg"
```

## Test 2: Storage Adapter Instantiation

Verify the storage adapter can be instantiated without errors.

### Node REPL Test

```bash
node
```

```javascript
const { createObjectStorage } = require('./src/infrastructure/storage/storage.factory.ts');

// This should succeed if BLOB_READ_WRITE_TOKEN is set
const storage = createObjectStorage();
console.log('Storage adapter created:', storage);
```

## Test 3: Container Integration

Verify the storage service is available through the DI container.

### Node REPL Test

```bash
node
```

```javascript
const { container, objectStorage } = require('./src/lib/container.ts');

// Test container has services
console.log('Container services:', Object.keys(container.services));
// Expected: ['objectStorage']

// Test objectStorage is available
console.log('Object storage available:', !!objectStorage);
// Expected: true
```

## Test 4: Generate Upload URL (Real Storage Test)

**Note:** This will make a real request to Vercel Blob if BLOB_READ_WRITE_TOKEN is set.

### Node REPL Test

```bash
node
```

```javascript
const { objectStorage } = require('./src/lib/container.ts');

(async () => {
  try {
    const intent = await objectStorage.generateUploadUrl(
      'properties/test123/images/testimg456.jpg',
      'image/jpeg',
      10485760, // 10MB
      300 // 5 minutes
    );
    
    console.log('Upload intent:', intent);
    // Expected: { uploadUrl: '...', storageKey: '...', expiresAt: Date }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

## Test 5: Get Object Metadata (Non-existent Object)

Test metadata retrieval for an object that doesn't exist.

### Node REPL Test

```bash
node
```

```javascript
const { objectStorage } = require('./src/lib/container.ts');

(async () => {
  try {
    const metadata = await objectStorage.getObjectMetadata(
      'properties/nonexistent/images/fake.jpg'
    );
    
    console.log('Metadata:', metadata);
    // Expected: { exists: false }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

## Test 6: Get Public URL

Test public URL generation.

### Node REPL Test

```bash
node
```

```javascript
const { objectStorage } = require('./src/lib/container.ts');

const url = objectStorage.getPublicUrl('properties/prop123/images/img456.jpg');
console.log('Public URL:', url);
// Expected: "https://blob.vercel-storage.com/properties/prop123/images/img456.jpg"
```

## Test 7: Database Schema

Verify the PropertyImage model has the new storageKey field.

### Prisma Studio

```bash
npx prisma studio
```

1. Open the `PropertyImage` model
2. Verify the `storageKey` field exists and is nullable
3. Verify all existing fields remain intact

### SQL Query

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'property_images' 
ORDER BY ordinal_position;
```

Expected columns:
- id (text, NO)
- propertyId (text, NO)
- storageKey (text, YES) ← NEW
- url (text, NO)
- alt (text, YES)
- sortOrder (integer, NO)
- isMain (boolean, NO)
- createdAt (timestamp, NO)

## Test 8: TypeScript Types

Verify type safety and autocomplete work correctly.

### VS Code Test

1. Open `src/lib/container.ts`
2. Type `container.services.` and verify autocomplete shows `objectStorage`
3. Type `objectStorage.` and verify autocomplete shows all 4 methods
4. Hover over method parameters to verify TypeScript types

## Test 9: Build Verification

Ensure the build completes successfully with all new code.

```bash
npm run build
```

Expected: No errors, successful production build.

## Test 10: Prisma Client Regeneration

Verify Prisma client includes the new storageKey field.

### Node REPL Test

```bash
node
```

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Check that PropertyImage type has storageKey
const schema = prisma._dmmf.modelMap.PropertyImage;
console.log('PropertyImage fields:', schema.fields.map(f => f.name));
// Expected to include 'storageKey'
```

## Manual Integration Test (Optional)

If you want to test the full upload flow with a real file:

```bash
node
```

```javascript
const { objectStorage } = require('./src/lib/container.ts');
const { generateImageStorageKey } = require('./src/application/ports/storage/storage-key.utils.ts');

(async () => {
  // 1. Generate storage key
  const storageKey = generateImageStorageKey('testprop123', 'testimg456', 'jpg');
  console.log('Storage key:', storageKey);
  
  // 2. Get upload URL
  const intent = await objectStorage.generateUploadUrl(
    storageKey,
    'image/jpeg',
    10485760
  );
  console.log('Upload URL:', intent.uploadUrl);
  
  // 3. Upload would happen here via browser/HTTP client
  // (This is a manual step - use curl or Postman)
  
  // 4. Check metadata
  const metadata = await objectStorage.getObjectMetadata(storageKey);
  console.log('Metadata after upload:', metadata);
  
  // 5. Get public URL
  const publicUrl = objectStorage.getPublicUrl(storageKey);
  console.log('Public URL:', publicUrl);
  
  // 6. Cleanup
  await objectStorage.deleteObject(storageKey);
  console.log('Deleted test object');
})();
```

## Success Criteria

✅ All TypeScript compilation passes  
✅ All linting passes (no new warnings)  
✅ Build succeeds  
✅ Prisma validates successfully  
✅ Storage adapter instantiates without errors  
✅ Storage key utilities work correctly  
✅ Container exports objectStorage  
✅ Database migration applied successfully  
✅ PropertyImage model has storageKey field  

## Notes

- Slice 1 does NOT include actual upload/confirmation endpoints
- Slice 1 does NOT include UI components
- Real file upload testing will be done in Slice 2/3
- These tests verify the foundation is ready for Slice 2
