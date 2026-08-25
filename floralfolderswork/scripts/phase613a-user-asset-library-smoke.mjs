import { LocalStorageUserAssetLibraryRepository } from '../packages/persistence/dist/asset-library-repository.js';
class MemoryStorage{data=new Map();getItem(k){return this.data.get(k)??null}setItem(k,v){this.data.set(k,v)}removeItem(k){this.data.delete(k)}}
const storage=new MemoryStorage();
const repo=new LocalStorageUserAssetLibraryRepository(storage);
const now=new Date().toISOString();
const asset={id:'asset-1',name:'Test Floral',kind:'SVG',sourceType:'DATA_URL',source:'data:image/svg+xml,%3Csvg/%3E',mimeType:'image/svg+xml',metadata:{userLibrary:true,createdAt:now,updatedAt:now}};
await repo.save(asset);
if((await repo.list()).length!==1)throw new Error('Save/list failed');
await repo.rename('asset-1','Renamed Floral');
if((await repo.list())[0]?.name!=='Renamed Floral')throw new Error('Rename failed');
const reopened=new LocalStorageUserAssetLibraryRepository(storage);
if((await reopened.list())[0]?.id!=='asset-1')throw new Error('Restart persistence failed');
await reopened.delete('asset-1');
if((await reopened.list()).length!==0)throw new Error('Delete failed');
console.log('Phase 6.1.3A user asset library smoke PASS');
