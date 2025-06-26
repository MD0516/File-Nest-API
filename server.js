const express = require('express')
const multer = require('multer')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { error } = require('console')
const { stdout, stderr } = require('process')
const cors = require('cors')

const upload = multer( { dest: 'uploads/' });

const app = express();
app.use(cors());

app.post('/convert/pdf-to-word', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded!' });
    }
    const pdfPath = req.file.path;
    const originalName = path.parse(req.file.originalname).name;
    const outputFileName = originalName + '.docx';
    const outputDir = path.join(__dirname, 'converted');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);    
    }
    const outputPath = path.join(__dirname, 'converted', outputFileName);

    const command = `python pdf-to-docx.py "${pdfPath}" "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`)
            return res.status(500).json({ message: 'conversion Failed'})
        }

        res.download(outputPath, 'converted.docx', (err) => {
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        })

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ message: 'Conversion failed', error: stderr });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on Port 3000')
})