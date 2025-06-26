const express = require('express')
const multer = require('multer')
const { execFile } = require('child_process')
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


    execFile('python3', ['pdf-to-docx.py', pdfPath, outputPath], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`)
            return res.status(500).json({ message: 'conversion Failed'})
        }

        const downloadURL = `https://file-nest-api.onrender.com/converted/${outputFileName}`;
        res.status(200).json({ downloadURL });

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ message: 'Conversion failed', error: stderr });
        }
    });
});

app.use('/converted', express.static(path.join(__dirname, 'converted')));

app.listen(3000, () => {
    console.log('Server is running on Port 3000')
})