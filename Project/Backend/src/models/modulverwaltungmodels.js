const pool = require('../confing/database');


async function getmodulbytitel(titel) {
    const[Module]= await pool.query('SELECT * FROM Module WHERE titel =?',[titel])
    return Module[0];
    
}
async function getalleoduls() {
    const[Module] = await pool.query('SELECT * FROM Module ')
    return Module;
    
}