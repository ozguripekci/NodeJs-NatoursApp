const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel')


dotenv.config({ path: './config.env' });


const DB = process.env.DATABASE.replace(
  '<PASSWORD>', 
  process.env.DATABASE_PASSWORD); 

mongoose
  .connect(DB, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(() => {
  console.log('DB connection succesful...');
})


// Read json file and convert
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'));

// Import data into database
const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Data succesfully imported');
    } catch (err) {
        console.log(err);
    }
    process.exit()
}

// delete all data from database
const deleteData = async () => {
    
    try {
        await Tour.deleteMany()
        console.log('Data succesfully deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit()

}

if(process.argv[2] === '--import') {
    importData()
} else if(process.argv[2] === '--delete') {
    deleteData()
}

