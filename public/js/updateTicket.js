/**{{!
  🔔 Citation for the following code:
  ---- Date: 3/10/2025
  ---- Adapted from Node.js Exploration: https://canvas.oregonstate.edu/courses/1987790/pages/exploration-developing-in-node-dot-js?module_item_id=25023025
  ---- Adapted from nodejs-starter-app: https://github.com/osu-cs340-ecampus/nodejs-starter-app
  }}*/

let updateTicketForm = document.getElementById('update-ticket-form')

updateTicketForm.addEventListener("submit", (e) => {
    e.preventDefault()

    let inputTicketBuyerEvent = document.getElementById("update-fullname-and-concert")
    let inputParking          = document.getElementById("update-parking")
    
    let ticketsSoldID   = inputTicketBuyerEvent.value;
    let parkingIncluded = inputParking.value;

    let data = {
        id: ticketsSoldID,
        parking: parkingIncluded
    }

    let xhttp = new XMLHttpRequest();
    xhttp.open("PUT", "/put-ticket", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            updateRow(parkingIncluded, ticketsSoldID);
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an errror with the input")
        }
    }
    xhttp.send(JSON.stringify(data));
})

function updateRow(data, id) {
    
    let parkingIncluded = data == "1" ? "Yes" : "No"

    let table = document.getElementById("ticket-table");

    for (let i = 0, row; row = table.rows[i]; i++) {
        
        if (table.rows[i].getAttribute("data-value") == id) {

            let updateRowIndex   = table.getElementsByTagName("tr")[i];   
            let td_parking       = updateRowIndex.getElementsByTagName("td")[4];
            if (td_parking) {
                td_parking.innerHTML = parkingIncluded;
            }
            else {
                console.warn("Parking column not found")
            }
            break;
        }
    }
}