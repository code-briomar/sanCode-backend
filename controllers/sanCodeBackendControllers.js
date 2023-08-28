import express, { json } from "express";
const app = express();
import cors from "cors";
// With xlsx, convert JSON data into an EXCEL spreadsheet
import { utils, writeFile } from "xlsx";
import moment from "moment-timezone";
import pkg from "body-parser";
const { json: _json } = pkg;
// Array holding ailments checked
import loadData from "../assets/ailmentsChecked.js";
app.use(cors());
app.use(json());
app.use(_json());

//Open a database connection
//Open a database RTCPeerConnection

//Database variables

// Timestamp
const timestamp = moment().tz("Africa/Nairobi").format("YYYY-MM-DD HH:mm:ss");
// Start of today date
const startOfToday = moment().startOf("day");
//End of today date
const endOfToday = moment().endOf("day");
import { db, staffTableName, studentTableName } from "../config/database.js";

//Return name of the API if requested
export const defaultResponse = async (req, res) => {
  res.status(200).send({
    status: 200,
    message: "Make requests to the san-code API",
  });
};
//Endpoint to validate that student exists in the database
export const getStudentByAdmissionNumber = async (req, res) => {
  const admissionNumber = req.params.admissionNumber;

  // Select table
  db.all(
    `SELECT * FROM ${studentTableName} WHERE admNo=${admissionNumber}`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows);
    }
  );
};

// Endpoint to accept data from the full entry submission
export const studentFullEntry = async (req, res) => {
  const { studentAdmNo, tempReading, complain, ailment, medication } = req.body;

  // Update record where student admno matches studentAdmNo
  db.run(
    `UPDATE ${studentTableName} SET tempReading=?, complain=?, ailment=?, medication=?, timestamp=?WHERE admNo=?`,
    [tempReading, complain, ailment, medication, timestamp, studentAdmNo[0]],
    (error) => {
      if (error) {
        res.status(500).send("Error updating the record.");
      } else {
        res.send(`Record updated for ${studentAdmNo} successfully.`);
      }
    }
  );
};

// Endpoint to accept data from the quick update submission
export const studentQuickUpdate = async (req, res) => {
  const { studentAdmNo, tempReading } = req.body;

  // Update record where student admission number matches studentAdmNo
  db.run(
    `UPDATE ${studentTableName} SET tempReading=?WHERE admNo=?`,
    [tempReading, studentAdmNo],
    (error) => {
      if (error) {
        res.status(500).send("Error updating the record.");
      } else {
        res.send(`Record updated for ${studentAdmNo} successfully.`);
      }
    }
  );
};

//Endpoint to validate that staff exists in the database
export const getStaffMemberByID = async (req, res) => {
  let idNo = req.params.idNo;

  // Select all from staff table
  db.all(
    `SELECT * FROM ${staffTableName} WHERE idNo=${idNo}`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows);
    }
  );
};

//Endpoint to create a record for a staff member
export const createStaffRecord = async (req, res) => {
  const { idNo, fName, sName } = req.body;

  //Insert a new record for the staff members
  db.run(
    `INSERT INTO ${staffTableName} (idNo, fName, sName) VALUES(?,?,?)`,
    [idNo, fName, sName],
    (error) => {
      if (error) {
        res.status(500).send(`Error creating the entry for ${fName}`);
      } else {
        res.status(200).send({
          status: 200,
          message: "Entry created successfully",
          idNo: idNo,
          fName: fName,
        });
      }
    }
  );
};

// Endpoint to accept data from the full entry submission for a staff member
export const staffFullEntry = async (req, res) => {
  const { idNo, tempReading, complain, ailment, medication } = req.body;

  // Update record where staff Kenyan id No matches idNo
  db.run(
    `UPDATE ${staffTableName} SET tempReading=?, complain=?, ailment=?, medication=? WHERE idNo=?`,
    [tempReading, complain, ailment, medication, idNo],
    (error) => {
      if (error) {
        res.status(500).send("Error updating the record.");
      } else {
        res.send(`Record updated for ${idNo} successfully.`);
      }
    }
  );
};

// Endpoint to accept data from the quick update submission for a staff member
export const staffQuickUpdate = async (req, res) => {
  const { idNo, tempReading } = req.body;

  // Update record where staff idNo matches idNo
  db.run(
    `UPDATE ${staffTableName} SET tempReading=? WHERE admNo=?`,
    [tempReading, idNo],
    (error) => {
      if (error) {
        res.status(500).send("Error updating the record.");
      } else {
        res.send(`Record updated for ${idNo} successfully.`);
      }
    }
  );
};

// Endpoint to fetch today's student data for purposes of the nurse filtering
export const getStudentData = (req, res) => {
  db.all(
    `SELECT * FROM ${studentTableName} ORDER BY timestamp DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
        return;
      }

      const data = rows.map((row) => {
        const obj = {};
        Object.keys(row).forEach((key) => {
          obj[key] = row[key];
        });
        return obj;
      });

      let filteredData = [];

      for (let i = 0; i < data.length; i++) {
        const dateToBeChecked = moment(
          data[i].timestamp,
          "YYYY-MM-DD HH:mm:ss"
        );
        if (dateToBeChecked.isBetween(startOfToday, endOfToday)) {
          filteredData.push(data[i]);
        }
      }

      res.json(filteredData);
    }
  );
};

// Endpoint to fetch today's staff data for purposes of the nurse filtering
export const getStaffData = (req, res) => {
  db.all(
    `SELECT * FROM ${staffTableName} ORDER BY timestamp DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
        return;
      }

      const data = rows.map((row) => {
        const obj = {};
        Object.keys(row).forEach((key) => {
          obj[key] = row[key];
        });
        return obj;
      });

      let filteredData = [];

      for (let i = 0; i < data.length; i++) {
        const dateToBeChecked = moment(
          data[i].timestamp,
          "YYYY-MM-DD HH:mm:ss"
        );
        if (dateToBeChecked.isBetween(startOfToday, endOfToday)) {
          filteredData.push(data[i]);
        }
      }

      res.json(filteredData);
    }
  );
};

// Endpoint to update report data
export const updateReport = async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(
        `SELECT staffRecordID AS recordID, idNo AS admNo, fName, sName, NULL AS class, tempReading, complain, ailment, medication, timestamp
        FROM ${staffTableName}
        UNION
        SELECT recordID, admNo, fName, sName, class, tempReading, complain, ailment, medication, timestamp
        FROM ${studentTableName}`,
        [],
        (err, rows) => {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    const data = rows.map((row) => {
      const obj = {};
      Object.keys(row).forEach((key) => {
        obj[key] = row[key];
      });
      return obj;
    });

    let filteredData = [];
    const startOfToday = moment().startOf("day");
    const endOfToday = moment().endOf("day");

    for (let i = 0; i < data.length; i++) {
      const dateToBeChecked = moment(data[i].timestamp, "YYYY-MM-DD HH:mm:ss");
      if (dateToBeChecked.isBetween(startOfToday, endOfToday)) {
        filteredData.push(data[i]);
      }
    }

    const ailmentsChecked = await loadData();
    const countByAilment = {};

    ailmentsChecked.forEach((eachAilment) => {
      const count = filteredData.filter(
        (item) => item.ailment === eachAilment
      ).length;
      countByAilment[eachAilment] = count;
    });

    const todayAsANumber = moment().date();

    const updatePromises = [];
    for (const eachAilmentToUpdate in countByAilment) {
      if (countByAilment.hasOwnProperty(eachAilmentToUpdate)) {
        const updateValue = countByAilment[eachAilmentToUpdate];
        const sqlUpdateReportTable = `UPDATE ${reportTableName} 
          SET "${todayAsANumber}" = ${updateValue}
          WHERE disease = "${eachAilmentToUpdate}"`;

        const updatePromise = new Promise((resolve, reject) => {
          db.run(sqlUpdateReportTable, (error) => {
            if (error) {
              console.error(
                "SQLITE STATEMENT EXECUTION STATEMENT ERROR : " + error.message
              );
              reject(error);
            } else {
              // console.log(`Updated ${eachAilmentToUpdate} with ${updateValue} for this day of the month : ${todayAsANumber}`);
              resolve();
            }
          });
        });

        updatePromises.push(updatePromise);
      }
    }

    await Promise.all(updatePromises);

    const dateTomorrow = moment().add(1, "day");
    const dateEndOfMonth = moment().endOf("month");
    let startingDate = dateTomorrow.clone();
    let batchSQLRevertStatements = [];

    while (startingDate.isSameOrBefore(dateEndOfMonth, "day")) {
      const columnNumber = startingDate.format("DD");
      const sqlRevertValues = `UPDATE ${reportTableName} 
        SET "${columnNumber}" = 0`;

      batchSQLRevertStatements.push(sqlRevertValues);
      startingDate.add(1, "day");
    }

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION;");
        batchSQLRevertStatements.forEach((eachSQLStatement) => {
          db.run(eachSQLStatement, (error) => {
            if (error) {
              console.error("BATCH TRANSACTION ERROR: " + error.message);
              reject(error);
            } else {
              // console.error("BATCH TRANSACTION FOR " + eachSQLStatement + " EXECUTED");
            }
          });
        });

        db.run("COMMIT;", (error) => {
          if (error) {
            console.error("BATCH TRANSACTION COMMIT ERROR: " + error.message);
            reject(error);
          } else {
            resolve();
          }
        });
      });
    });

    res.json({ status: "successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Error" });
  }
};

// Endpoint to generate excel
export const generateExcel = (req, res) => {
  // Select all records from both the students table and staff table
  db.all(
    `SELECT staffRecordID AS recordID, idNo AS admNo, fName, sName, NULL AS tName, NULL AS fourthName, NULL AS class, tempReading, complain, ailment, medication, timestamp
    FROM ${staffTableName}
    UNION
    SELECT recordID, admNo, fName, sName, tName, fourthName, class, tempReading, complain, ailment, medication, timestamp
    FROM ${studentTableName}`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);
      }

      // Transform the rows to objects
      const data = rows.map((row) => {
        const obj = {};
        Object.keys(row).forEach((key) => {
          obj[key] = row[key];
        });
        return obj;
      });

      let filteredData = []; //Just like the data array but holds records whose date matches today's
      let dateToBeChecked;
      // Loop through the data array which holds the records as individual objects.
      for (
        let dataArrayLength = 0;
        dataArrayLength < data.length;
        dataArrayLength++
      ) {
        //Filter and only retrieve records whose timestamp matches to today's
        // Format the date to Moment.js format
        dateToBeChecked = moment(
          data[dataArrayLength].timestamp,
          "YYYY-MM-DD HH:mm:ss"
        );

        // If it falls between start of today and end of the day, spread it into the filteredData array
        // Since it will be handling a lot of data, using the spread operator is kind of effective
        if (dateToBeChecked.isBetween(startOfToday, endOfToday)) {
          filteredData = [...filteredData, data[dataArrayLength]];
        }
      }

      // Use xlsx module to convert the filteredData array into an excel document
      const worksheet = utils.json_to_sheet(filteredData);
      const workbook = utils.book_new(worksheet);

      // Change the worksheet headers to names that kind of look good.
      utils.sheet_add_aoa(
        worksheet,
        [
          [
            "ID",
            "Admission Number",
            "First Name",
            "Second Name",
            "Third Name",
            "Fourth Name",
            "Class",
            "Temperature Reading",
            "Complains",
            "Ailment",
            "Medication",
            "TimeStamp",
          ],
        ],
        {
          origin: "A1",
          font: { bold: true },
          border: {
            top: { style: "thin", color: "000000" },
            bottom: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" }, // Set right border style and color
          },
        }
      );
      // Change columns width based on the width of the characters
      worksheet["!cols"] = [{ wch: 10 }];
      // Append the worksheet to the workbook
      // Set today's date as the title of the worksheet
      utils.book_append_sheet(
        workbook,
        worksheet,
        moment().format("dddd, Do MMMM YYYY")
      );

      // Export it into the 'workbooks' folder
      let fileName = moment().format("dddd, Do MMMM YYYY");
      fileName = fileName.replace(/ /g, "_").replace(/,/g, "");
      writeFile(workbook, `workbooks/${fileName}.xlsx`, { compression: true });

      res.json(filteredData);
    }
  );
};

//Endpoint to post new student details
export const newStudents = async (req, res) => {
  //Binding to hold onto the array with student details
  const arrayWithStudentDetails = req.body;

  //We'll insert this data into the database

  //Insert prepared statement
  const insertQuery = `INSERT INTO ${studentTableName} (fName, sName, admNo, class) VALUES(?,?,?,?)`;
  const selectQuery = `SELECT COUNT(*) as count from ${studentTableName} WHERE admNo=?`;

  arrayWithStudentDetails.forEach((eachItem) => {
    // Check if the record exists
    db.get(selectQuery, [eachItem[2]], (error, result) => {
      // Catch an expected error
      if (error) {
        console.error("There's been an error. Details:", error);
        return;
      }

      // If there's no match or result.count is undefined, run the insert query
      if (result.count === 0 || typeof result.count === "undefined") {
        db.run(insertQuery, eachItem, (error) => {
          if (error) {
            console.error("Error inserting data:", error);
          }

          // Log to show data has been inserted
          console.log(`Row inserted with the Admission Number: ${eachItem[2]}`);
        });
      } else {
        console.log(
          `Skipping insertion for admNo ${eachItem[2]} as it already exists.`
        );
      }
    });
  });

  res.send({
    status: 200,
    message: "Database has been updated",
  });
};

// Endpoint to get disease names
export const getDiseaseNames = (req, res) => {
  db.all(`SELECT disease FROM ${reportTableName}`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
    }

    const data = rows.map((row) => {
      const obj = {};
      Object.keys(row).forEach((key) => {
        obj[key] = row[key];
      });
      return obj;
    });
    res.json(data);
  });
};

// Endpoint to return report data
export const getReportData = (req, res) => {
  // Select table
  db.all(`SELECT * FROM ${reportTableName}`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
    }

    // Transform the rows to objects
    const data = rows.map((row) => {
      const obj = {};
      Object.keys(row).forEach((key) => {
        obj[key] = row[key];
      });
      return obj;
    });
    res.json(data);
  });
};

//Endpoint to return data for the analytics page
// Endpoint to return report data with pagination
export const getReportAnalytics = (req, res) => {
  const page = req.query.page || 1; // Get the page number from the request query, default to 1
  const pageSize = 10; // Number of records to return per page

  // Calculate the offset based on the page number and page size
  const offset = (page - 1) * pageSize;

  // Select table with pagination
  db.all(
    `SELECT * FROM ${reportTableName} LIMIT ? OFFSET ?`,
    [pageSize, offset],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Transform the rows to objects
      const data = rows.map((row) => {
        const obj = {};
        Object.keys(row).forEach((key) => {
          obj[key] = row[key];
        });
        return obj;
      });

      res.json(data);
    }
  );
};