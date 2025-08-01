// App.js

/**{{!
  🔔 Citation for the following code:
  ---- Date: 3/10/2025
  ---- Adapted from Node.js Exploration: https://canvas.oregonstate.edu/courses/1987790/pages/exploration-developing-in-node-dot-js?module_item_id=25023025
  ---- Adapted from nodejs-starter-app: https://github.com/osu-cs340-ecampus/nodejs-starter-app
  }}*/

/*
    SETUP
    Based on cs340 Starter Code
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
PORT        = 8239;                 // Set a port number at the top so it's easy to change in the future

const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

// Database
var db = require('./database/db-connector')

/*
    ROUTES
*/
app.get('/', function(req, res)
    {
        res.render('index')
    })


app.get('/organizers', function(req, res)
    {
        let query1 = "SELECT * FROM Organizers";
        db.pool.query(query1, function(error, rows, fields){
            res.render('organizers', {data: rows});
        })
    });

app.post('/addOrganizer', function(req, res) {
    // Collect the incoming data
    let data = req.body
    
    const organizer = {
        firstname: data['input-organizer-firstname'],
        lastname: data['input-organizer-lastname'],
        company: data['input-companyname'],
        email: data['input-organizer-email']
    };

    query1 = `INSERT INTO Organizers (firstName, lastName, companyName, email)
            VALUES ('${organizer.firstname}', '${organizer.lastname}', '${organizer.company}','${organizer.email}')`;
    
    db.pool.query(query1, function(error, rows, fields) {
        if (error){
            console.log(error)
            res.sendStatus(400);
        }
        else {
            res.redirect('/organizers')
        }
    })        

})

app.delete('/delete-organizer', (req, res, next) => {
    let data = req.body
    let id = parseInt(data.id);
    let deleteOrg = `DELETE FROM Organizers WHERE organizerID = ?`

    db.pool.query(deleteOrg, [id], (error, rows, fields) => {
        if (error) {
            console.log(error)
            res.sendStatus(400)
        }
        else {
            res.sendStatus(204)
        }
    })
})

app.put('/put-organizer', (req, res, next) => {
    let data    = req.body;
    let id      = data.fullname;
    let company = data.company;
    let email   = data.email;

    let queryUpdateOrganizer = `UPDATE Organizers SET companyName = ?, email = ? WHERE organizerID = ?`

    db.pool.query(queryUpdateOrganizer, [company, email, id], (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.send(rows)
        }
    })
})

app.get('/events', function(req, res)
    {
        let query1 = "SELECT * FROM Events";
        let query2 = "SELECT * FROM Organizers"

        db.pool.query(query1, function(error, rows, fields){
            
            let data = rows

            for (let i = 0; i < data.length; i++) {
                date_to_string = JSON.stringify(data[i].eventDate)
                formatted_date = date_to_string.slice(1, 11) 
                data[i].eventDate = formatted_date
            }
            
            db.pool.query(query2, (errors, rows, fields) => {
                let organizers = rows 
                return res.render('events', {data: data, organizers: organizers})
            })

        })
    });

//Add a new event
app.post('/addEvent', function (req, res) {
    let data = req.body;

    const event = {
        eventName: data['input-eventName'],
        eventDate: data['input-eventDate'],
        eventType: data['input-eventType'],
        organizerID: data['input-organizerID']
    };

    query1 = `INSERT INTO Events (eventName, eventDate, eventType, organizerID)
                  VALUES ('${event.eventName}', '${event.eventDate}', '${event.eventType}', '${event.organizerID}')`;

    db.pool.query(query1, function(error, rows, fields)  {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/events'); 
        }
    });
});

// DELETE an event
app.delete('/delete-event', (req, res, next) => {
    let data = req.body;
    let eventID = parseInt(data.id);

    let deleteEventQuery = `DELETE FROM Events WHERE eventID = ?`;

    db.pool.query(deleteEventQuery, [eventID], (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204);
        }
    });
});

//UPDATE an event
app.put('/update-event', (req, res, next) => {
    let data = req.body;

    //const eventIDNameValue = data.eventIDNameValue;
    const eventID = data.eventID; 
    //const eventName = data.eventName; 
    const eventDate = data.eventDate;
    //const eventType = data.eventType;
    let organizerID = data.organizerID;

    //organizerID to NULL
    if (!organizerID || organizerID.trim() === "") {
        organizerID = null;
    }

    let queryUpdateEvent = `UPDATE Events 
                            SET eventDate = ?,organizerID = ? 
                            WHERE eventID = ?`;

    db.pool.query(queryUpdateEvent, [eventDate, organizerID, eventID], (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.send(rows);
        }
    });
});

app.get('/ticketbuyers', function(req, res)
    {
        let query1 = "SELECT * FROM TicketBuyers";
        db.pool.query(query1, function(error, rows, fields){
            res.render('ticketbuyers', {data: rows});
        })
    })

//ADD TicketBuyer
app.post('/addTicketBuyer', (req, res) => {
    let data = req.body;

    const ticketBuyer = {
        firstName: data['input-firstname'],
        lastName: data['input-lastname'],
        email: data['input-email'],
        address: data['input-address']
    };

    let query = `INSERT INTO TicketBuyers (firstName, lastName, email, address)
                 VALUES ('${ticketBuyer.firstName}', '${ticketBuyer.lastName}', '${ticketBuyer.email}', '${ticketBuyer.address}')`;

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/ticketbuyers');
        }
    });
});

//DELETE TicketBuyer
app.delete('/delete-ticket-buyer', (req, res) => {
    let data = req.body;
    let ticketBuyerID = parseInt(data.id); 

    let deleteTicketBuyerQuery = `DELETE FROM TicketBuyers WHERE ticketBuyerID = ?`;

    db.pool.query(deleteTicketBuyerQuery, [ticketBuyerID], (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204);
        }
    });
});

//UPDATE ticket buyer
app.put('/put-ticketBuyer', (req, res) => {
    let data = req.body;
    let ticketBuyerID = data.ticketBuyerID;
    let email = data.email;
    let address = data.address;

    let queryUpdateTicketBuyer = `UPDATE TicketBuyers SET email = ?, address = ? WHERE ticketBuyerID = ?`;

    db.pool.query(queryUpdateTicketBuyer, [email, address, ticketBuyerID], (error, rows, fields) => {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.send(rows);
        }
    });
});

app.get('/ticketssold', function(req, res)
    {
        const seats = Array.from({length: 50 }, (_, i) => i + 1);
        const sections = Array.from({length: 40}, (_,i) => i + 100);
        let query1 = "SELECT * FROM TicketsSold";
        let query2 = "SELECT * FROM Events";
        let query3 = "SELECT * FROM TicketBuyers";
        let query4 = `SELECT TicketsSold.ticketsSoldID, Events.eventName, TicketBuyers.firstName, TicketBuyers.lastName 
                        FROM TicketsSold
                        JOIN Events on TicketsSold.eventID = Events.eventID
                        JOIN TicketBuyers on TicketsSold.ticketBuyerID = TicketBuyers.ticketBuyerID;`        

        db.pool.query(query1, function(error, rows, fields){
            let tickets = rows;
            
            for (let i = 0; i < tickets.length; i++) {
                tickets[i]["parkingIncluded"] 
                ? tickets[i]["parkingIncluded"] = "Yes"
                : tickets[i]["parkingIncluded"] = "No"
            }

            db.pool.query(query2, (err, rows, fields) => {
                let events = rows;

                db.pool.query(query3, (err, rows, fields) => {
                    let ticketbuyers = rows;

                    db.pool.query(query4, (err, rows, fields) => {
                        let update = rows;

                        return res.render('ticketssold', {
                            data: tickets, 
                            events: events, 
                            buyers: ticketbuyers, 
                            seats: seats, 
                            sections: sections,
                            updates: update
                            })
                    })  
                })
            })
        })
    })

app.post('/addTicket', (req, res) => {
    let data = req.body

    const ticket = {
        eventID: data['input-event-tickets'],
        ticketBuyerID: data['input-buyer-tickets'],
        seat: data['input-seat-tickets'],
        section: data['input-section-tickets'],
        price: data['input-ticket-price'],
        parking: data['input-parking']
    };

    query1 = `INSERT INTO TicketsSold (ticketBuyerID, eventID, price, seat, section, parkingIncluded)
            VALUES ('${ticket.ticketBuyerID}', '${ticket.eventID}', '${ticket.price}', '${ticket.seat}', '${ticket.section}','${ticket.parking}')`
    
    db.pool.query(query1, (error, rows, fields) => {
        if (error){
            console.log(error)
            res.sendStatus(400);
        }
        else {
            res.redirect('/ticketssold')
        }
    })
})

app.delete('/delete-ticket', (req, res) => {
    let data = req.body;
    let id = parseInt(data.id);
    let deleteTicket = `DELETE FROM TicketsSold WHERE ticketsSoldID = ?`

    db.pool.query(deleteTicket, [id], (error, rows, fields) => {
        if (error) {
            console.log(error)
            res.sendStatus(400)
        }
        else {
            res.sendStatus(204)
        }
    })
})

app.put('/put-ticket', (req, res) => {
    let data = req.body;
    let id = data.id
    let parking = data.parking

    let queryUpdateTicket = `UPDATE TicketsSold SET parkingIncluded = ? WHERE ticketsSoldID = ?`;

    db.pool.query(queryUpdateTicket, [parking, id] , (err, rows, fields) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        }
        else {
            res.send(rows)
        }
    })
})


/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
