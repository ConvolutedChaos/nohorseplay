// Filesysem helpers
let debugLog = true;

const iconBlobCache = new Map();

/**
 * Resolve an absolute path string to its node, or null if not found.
 * Works with any path rooted at "/", e.g. "/home/e-dog/Desktop/file.txt"
 */
async function _fsResolve(path) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return await idbGet('root');

    let currentId = 'root';
    let node = null;

    for (const part of parts) {
        const children = await idbGetAllByIndex('parentId', currentId);
        node = children.find(n => n.name === part);
        if (!node) return null;
        currentId = node.id;
    }
    return node;
}

/**
 * Walk the path parts and ensure every intermediate directory exists,
 * creating missing ones automatically.
 * Returns the id of the parent folder for the final segment.
 */
async function _fsEnsureParents(parts) {
    let currentId = 'root';

    for (let i = 0; i < parts.length - 1; i++) {
        const children = await idbGetAllByIndex('parentId', currentId);
        let dir = children.find(n => n.name === parts[i] && n.type === 'folder');

        if (!dir) {
            const id = crypto.randomUUID();
            dir = {
                id,
                name: parts[i],
                type: 'folder',
                parentId: currentId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await idbAdd(dir);
        }

        currentId = dir.id;
    }

    return currentId;
}

/**
 * Access a file at an absolute path.
 *
 * Returns an object with the node's metadata plus one of:
 *   { ...node, contentType: 'text',   text:   string        }
 *   { ...node, contentType: 'binary', buffer: ArrayBuffer   }
 *   { ...node, contentType: 'empty',  text:   ''            }
 *
 * Throws if the path doesn't exist or points to a folder.
 *
 * @example
 *   const file = await accessFile("/home/e-dog/Desktop/notes.txt");
 *   console.log(file.text);
 */
async function accessFile(path) {
    turnOnDriveLight();
    if (debugLog) console.log(`accessFile: Loading file from: ${path}...`);
    try {
        const node = await _fsResolve(path);

        if (!node) throw new Error(`accessFile: no such file or directory: "${path}"`);
        if (node.type !== 'file') throw new Error(`accessFile: is a directory: "${path}"`);

        const raw = node.content;

        if (raw === null || raw === undefined || raw === '') {
            return { ...node, contentType: 'text', text: '' };
        }

        if (raw instanceof ArrayBuffer) {
            try {
                const text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
                return { ...node, contentType: 'text', text };
            } catch {
                return { ...node, contentType: 'binary', buffer: raw };
            }
        }

        if (typeof raw === 'string') {
            return { ...node, contentType: 'text', text: raw };
        }

        return { ...node, contentType: 'binary', buffer: raw };
    } finally {
        turnOffDriveLight();
    }
}

/**
 * Create a file at an absolute path.
 * Any missing intermediate directories are created automatically.
 * If the file already exists, returns the existing node without overwriting.
 *
 * @param {string} path     - Absolute path, e.g. "/usr/share/myapp/config.txt"
 * @param {string|ArrayBuffer} [content='']  - Initial file content (optional)
 * @returns {Promise<object>} The created (or existing) node
 *
 * @example
 *   const file = await createFile("/home/e-dog/Documents/hello.txt", "Hello!");
 *   console.log(file.id);
 */
async function createFile(path, content = '') {
    turnOnDriveLight();
    if (debugLog) console.log(`createFile: Creating file in: ${path}...`);
    try {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) throw new Error(`createFile: invalid path: "${path}"`);

        const name = parts[parts.length - 1];
        const parentId = await _fsEnsureParents(parts);

        const siblings = await idbGetAllByIndex('parentId', parentId);
        const existing = siblings.find(n => n.name === name);
        if (existing) {
            if (existing.type !== 'file')
                throw new Error(`createFile: path exists and is a directory: "${path}"`);
            return existing;
        }

        const size = typeof content === 'string'
            ? new Blob([content]).size
            : (content?.byteLength ?? 0);

        const node = {
            id: crypto.randomUUID(),
            name,
            type: 'file',
            parentId,
            content,
            size,
            mime: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await idbAdd(node);
        await renderAllWindows();
        return node;
    } finally {
        turnOffDriveLight();
    }
}

/**
 * Create a folder (and any missing parents) at an absolute path.
 * If the folder already exists, returns the existing node silently.
 *
 * @param {string} path - Absolute path, e.g. "/home/e-dog/Projects/myapp"
 * @returns {Promise<object>} The created (or existing) node
 *
 * @example
 *   const folder = await createFolder("/home/e-dog/Pictures/Vacation/2025");
 *   console.log(folder.id);
 */
async function createFolder(path) {
    turnOnDriveLight();
    if (debugLog) console.log(`createFolder: Creating folder in: ${path}...`);
    try {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) throw new Error(`createFolder: invalid path: "${path}"`);

        let currentId = 'root';
        let lastNode = null;

        for (const part of parts) {
            const children = await idbGetAllByIndex('parentId', currentId);
            let node = children.find(n => n.name === part && n.type === 'folder');

            if (!node) {
                const id = crypto.randomUUID();
                node = {
                    id,
                    name: part,
                    type: 'folder',
                    parentId: currentId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                await idbAdd(node);
            }

            currentId = node.id;
            lastNode = node;
        }

        await renderAllWindows();
        return lastNode;
    } finally {
        turnOffDriveLight();
    }
}

// Just sets an image's SRC to an image as specified in the path.
// Update: Added support for CSS background images.
async function imgFromFS(path, options = {}) {
    if (debugLog) console.log(`imgFromFS: Loading image from: ${path}...`);

    const file = await accessFile(path);
    const blob = new Blob(
        [file.contentType === 'text' ? file.text : file.buffer],
        { type: file.mime || 'image/' + path.split('.').pop() }
    );
    const url = URL.createObjectURL(blob);

    // CSS background image — apply to a target element or return the URL
    if (options.background) {
        const target = options.background instanceof Element ? options.background : null;
        if (target) {
            target.style.backgroundImage = `url("${url}")`;
            if (options.size) target.style.backgroundSize = options.size;
            if (options.position) target.style.backgroundPosition = options.position;
            if (options.repeat) target.style.backgroundRepeat = options.repeat;

            // Revoke after a short delay — can't use onload for background images
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            return target;
        }

        // No element given — just return the CSS string so the caller can use it
        return `url("${url}")`;
    }

    // Default: return an <img> element
    const img = document.createElement('img');
    img.src = url;
    img.onload = () => URL.revokeObjectURL(url);
    return img;
}

async function loadIconImg(fsPath, webPath, sizeCss = 'width:100%;height:100%;object-fit:contain;') {
    if (!iconBlobCache.has(fsPath)) {
        try {
            // Try virtual FS first
            const file = await accessFile(fsPath);
            const blob = new Blob(
                [file.contentType === 'text' ? file.text : file.buffer],
                { type: file.mime || 'image/' + fsPath.split('.').pop() }
            );
            iconBlobCache.set(fsPath, blob);
        } catch {
            // FS miss — fetch from web server and cache that blob too
            try {
                const response = await fetch(webPath);
                if (response.ok) {
                    iconBlobCache.set(fsPath, await response.blob());
                } else {
                    iconBlobCache.set(fsPath, null); // 404 etc — cache the failure
                }
            } catch {
                iconBlobCache.set(fsPath, null); // network error — cache the failure
            }
        }
    }

    const cached = iconBlobCache.get(fsPath);

    if (cached) {
        const url = URL.createObjectURL(cached);
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = sizeCss;
        img.onload = () => URL.revokeObjectURL(url);
        return img;
    }

    // Both sources failed — return broken img pointed at web path as last resort
    const img = document.createElement('img');
    img.style.cssText = sizeCss;
    img.src = webPath;
    return img;
}