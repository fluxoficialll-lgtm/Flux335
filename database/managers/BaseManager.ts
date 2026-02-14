
import { sqlite } from '../engine';

/**
 * BaseManager refatorado para operar sobre o JSON Engine de forma síncrona.
 */
export class BaseManager {
    protected queryAll<T>(table: string): T[] {
        const data = sqlite.getTableData(table);

        if (!Array.isArray(data)) {
            console.warn(`[BaseManager] Data for table '${table}' is not an array. Returning empty array.`);
            return [];
        }

        return data.map(item => {
            // FIX: Robust parsing to handle inconsistencies
            if (typeof item.data === 'string') {
                try {
                    const parsed = JSON.parse(item.data);
                    return { ...item, ...parsed };
                } catch (e) {
                    console.warn(`[BaseManager] Failed to parse item data for table '${table}'.`, e);
                    return item; 
                }
            }
            return item;
        });
    }

    protected queryOne<T>(table: string, id: string | number): T | undefined {
        const items = this.queryAll<any>(table);
        const found = items.find(i => String(i.id) === String(id));
        return found as T | undefined;
    }

    protected upsert(table: string, id: string | number, data: any, extra?: { timestamp?: number }) {
        const items = this.queryAll<any>(table);
        const index = items.findIndex(i => String(i.id) === String(id));
        
        const newItem = { 
            ...data, 
            id: String(id), 
            timestamp: extra?.timestamp || data.timestamp || Date.now() 
        };

        if (index > -1) {
            items[index] = newItem;
        } else {
            items.push(newItem);
        }

        sqlite.saveTableData(table, items);
    }
}
