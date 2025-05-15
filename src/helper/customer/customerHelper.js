const puppeteer = require("puppeteer");
const { default: formatDate } = require("../../utils/formatDate");
const { generatePdfAsBuffer } = require("../../utils/generatePdfBuffer");
const activities = [
    { name: "isWatering", label: "Watering" },
    { name: "isTrimming", label: "Trimming" },
    { name: "isPestCheck", label: "Checking Pest And Disease Infection" },
    { name: "isFertilizer", label: "Fertilizer Application" },
    { name: "isToppingUp", label: "Topping Up And Soil Mix" },
];
const createCustomerPdf = async ({ customer }) => {
    const options = {
        format: "A4",
        type: "buffer",
    };

    const htmlContent = `
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .heading {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }
        .details-table td {
            padding: 12px;
            border: 1px solid #ddd;
        }
        .key {
            font-weight: bold;
            background-color: #f4f4f4;
        }
    </style>
    <div>
        <h2 class="heading">Supplier Details</h2>
        <table class="details-table">
        <tr><td class="key">Customer</td><td>${
            customer?.company || ""
        } </td></tr>
            <tr><td class="key">Mobile No</td><td>${
                customer?.phone || ""
            }</td></tr>
            <tr><td class="key">Email</td><td>${customer?.email || ""}</td></tr>
            <tr><td class="key">City</td><td>${customer?.city || ""}</td></tr>
            <tr><td class="key">Site Supervisor Name</td><td>${
                customer?.siteSupervisorName || ""
            }</td></tr>
            <tr><td class="key">Site Supervisor Mobile No</td><td>${
                customer?.siteSupervisorMobileNumber || ""
            }</td></tr>
            <tr><td class="key">Site Supervisor Email</td><td>${
                customer?.siteSupervisorEmail || ""
            }</td></tr>
            <tr><td class="key">Accountant</td><td>${
                customer?.accountsName || ""
            }</td></tr>
            <tr><td class="key">Accountant Email</td><td>${
                customer?.accountsEmail || ""
            }</td></tr>
            <tr><td class="key">Accountant Mobile No</td><td>${
                customer?.accountsMobileNumber || ""
            }</td></tr>
            <tr><td class="key">Accountant 2</td><td>${
                customer?.accountsName2 || ""
            }</td></tr>
            <tr><td class="key">Accountant 2 Email</td><td>${
                customer?.accountsEmail2 || ""
            }</td></tr>
            <tr><td class="key">Accountant 2 Mobile No</td><td>${
                customer?.accountsMobileNumber2 || ""
            }</td></tr>
        </table>
    </div>`;

    try {
        const pdfBuffer = await generatePdfAsBuffer(htmlContent, options);

        return pdfBuffer;
    } catch (err) {
        console.error("Error generating PDF:", err);
        throw err;
    }
};

const createSericesPdf = async ({ reports }) => {
    const options = {
        format: "A4",
        type: "buffer",
        orientation: "landscape",
    };

    const tableRows = reports
        .map((report, index) => {
            const imageurl = report?.image
                ? `${process.env.SERVER_URL}${report?.image}`
                : "";
            return `
        <tr class="table-row">
            <td class="p-1 text-center border border-gray-700">${index + 1}</td>
            <td class="p-1 text-center border border-gray-700">${
                report.projectNo || "N/A"
            }</td>
            <td class="p-1 text-center border border-gray-700">${new Date(
                report.serviceDate
            ).toLocaleString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })}</td>
            <td class="p-1 text-center border border-gray-700">${
                report.status || "N/A"
            }</td>
            <td class="p-1 text-center border border-gray-700">${report.workerDetails
                .map((workerDetail) => workerDetail?.employeeName)
                .filter(Boolean)
                .join(", ")}</td>
            
            ${
                activities && activities.length > 0
                    ? activities
                          .map((activity) => {
                              return `
                    <td class="p-1 text-center border border-gray-700">
                        ${report[activity?.name] ? "Yes" : "No"}
                    </td>`;
                          })
                          .join("") // Join all activity cells without commas
                    : ""
            }
            
            <td class="p-1 text-center border border-gray-700">${
                report.serviceTimeIn || "N/A"
            }</td>
            <td class="p-1 text-center border border-gray-700">${
                report.serviceTimeOut || "N/A"
            }</td>
            <td class="p-1 text-center border border-gray-700">
                <img src="${imageurl}" alt="signature" width="130px" height="70px" class="mr-2">
            </td>
            <td class="p-1 text-center border border-gray-700">${
                report.signedBy || "N/A"
            }</td>
            <td class="p-1 text-center border border-gray-700">${new Date(
                report.signedTime
            ).toLocaleString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })}</td>
        </tr>`;
        })
        .join(""); // Ensure rows are joined without any commas

    const htmlContent = `
        <style>

        body::before {
            content: "";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
        background-image: url('${
            process.env.SERVER_URL || "http://localhost:3000"
        }/public/images/logoNoBg.png');            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 60%;
            height: 60%;
            z-index: -1;
            pointer-events: none;
          }
          
          .leads-table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Montserrat';
          }
      
          .table-header th {
            background-color: #555;
            font-weight: bold;
            padding: 10px;
            text-align: center;
            color: white;
          }
      
          .table-row td {
            padding: 8px;
            text-align: center;
            border: 1px solid #ccc;
          }
      
          .table-row img {
            border-radius: 5px;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          }
      
          a {
            text-decoration: none;
          }
      
          .flex {
            display: flex;
          }
      
          .justify-center {
            justify-content: center;
          }
      
          .mr-2 {
            margin-right: 8px;
          }
      
          .heading {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
      
        

      
        
        </style>
      
        <div class="overflow-x-auto">
          <h2 class="heading">Plant Maintenance Report</h2>
          <div class="watermark"></div>
          <table class="leads-table">
            <thead class="table-header">
              <tr>
                <th>No.</th>
                <th>Project No.</th>
                <th>Service Date</th>
                <th>Service Status</th>
                <th>Serviced By</th>
                ${
                    activities && activities.length > 0
                        ? activities
                              .map(
                                  (activity) =>
                                      `<th class="text-center">${activity.label}</th>`
                              )
                              .join("")
                        : ""
                }
                <th>Time In</th>
                <th>Time Out</th>
                <th>Sign</th>
                <th>Signed By</th>
                <th>Signed Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;

    try {
        const pdfBuffer = await generatePdfAsBuffer(htmlContent, true);
        return pdfBuffer;
    } catch (err) {
        console.error("Error generating PDF:", err);
        throw err;
    }
};

module.exports = { createCustomerPdf, createSericesPdf };
