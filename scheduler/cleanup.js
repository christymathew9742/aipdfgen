//delet uploded file older after 10 days
//This script will delete folders in the 'uploads' directory that are older than 10 days
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

cron.schedule('0 0 * * *', () => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
        console.error('Upload directory does not exist:', uploadDir);
        return;
    }
    fs.readdir(uploadDir, (err, folders) => {
        if (err) return console.error('Error reading upload directory:', err);

        folders.forEach(folder => {
            if (folder.startsWith('PDF-')) {
                const dateStr = folder.replace('PDF-', '');
                const folderDate = new Date(dateStr);
                const tenDaysAgo = new Date();
                tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

                if (folderDate < tenDaysAgo) {
                    const folderPath = path.join(uploadDir, folder);
                    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error(`Error deleting ${folderPath}:`, err);
                        } else {
                            console.log(`Deleted old folder: ${folderPath}`);
                        }
                    });
                }
            }
        });
    });
});


