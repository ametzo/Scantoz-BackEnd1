const fs = require("fs");
const { exec } = require("child_process");
const uuid = require("uuid");
const path = require("path");

function generatePdfFromHtmlAndSave(htmlContent, isLandscape = false) {
    return new Promise((resolve, reject) => {
        const outputPdfDirectory = path.join(__dirname, "../../public", "pdf");
        if (!fs.existsSync(outputPdfDirectory)) {
            fs.mkdirSync(outputPdfDirectory, { recursive: true });
        }

        const randomNum = Math.floor(Math.random() * 10000);
        const tempHtmlFile = path.join(
            outputPdfDirectory,
            `temp-${uuid.v4()}-${randomNum}.html`
        );
        const tempPdfFile = path.join(
            outputPdfDirectory,
            `output-${uuid.v4()}-${randomNum}.pdf`
        );

        fs.writeFileSync(tempHtmlFile, htmlContent);

        const orientationFlag = isLandscape ? "--orientation landscape" : "";
        exec(
            `wkhtmltopdf ${orientationFlag} --page-size A4 ${tempHtmlFile} ${tempPdfFile}`,
            (err, stdout, stderr) => {
                if (err) {
                    reject(`Error generating PDF: ${stderr}`);
                    return;
                }

                fs.unlinkSync(tempHtmlFile);

                const pdfBuffer = fs.readFileSync(tempPdfFile);
                fs.unlinkSync(tempPdfFile);

                resolve(pdfBuffer);
            }
        );
    });
}

async function generatePdfAsBuffer(htmlContent, isLandscape) {
    try {
        const pdfBuffer = await generatePdfFromHtmlAndSave(
            htmlContent,
            isLandscape
        );
        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}

module.exports = {
    generatePdfAsBuffer,
};
