/*
 
 */

const { PrismaClient } = require('@prisma/client'); // Import the auto-generated Prisma client class

/**
 * Single shared Prisma client instance for this module.
 * Creating multiple PrismaClient instances in one process is wasteful
 * (each opens its own connection pool), so we instantiate once and reuse.
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = new PrismaClient();




const createUser = async (req, res) => {
  try {
   
    
 

    //console.log('Creating user with data:', { username, email, password, firstName, lastName, homeAddress, role });
    const { username, email, password, firstName, lastName, homeAddress, role } = req.body;
    const newUser = await prisma.user.create({
      data: {
        username,   
        email,
        password,
        firstName,
        lastName,
        homeAddress,
        role,
        },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ error: 'Failed to create user.' });
  }
};



const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
       
        username: true, // returns the profile's username
        email:     true, // returns the profile's email
        password:  true, // returns the profile's password
        firstName: true, // returns the profile's first name
        lastName:  true, // returns the profile's last name
        homeAddress:  true, // returns the profile's hometown
        role: true, // returns the profile's role (e.g., admin, user)
      },
      orderBy: { username: 'asc' }, // Sort alphabetically by username so the list is predictable
    });

    // Return the total count alongside the array so clients can paginate or display "X results"
    // without having to count the array themselves.
    res.status(200).json({
      count: users.length, // Total number of users returned
      data:  users,        // Array of user objects with nested relations
    });
  } catch (error) {
    // Log the full error server-side for debugging, but send only a generic
    // message to the client to avoid exposing internal database details.
    console.error('getAllUsers error:', error);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export the controller functions so books.routes.js can attach them
 * to the correct HTTP method + path combinations.
 */
module.exports = {
  createUser,
  getAllUsers,
};