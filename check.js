
values = []

// Simple email regex. A more complicated one took too long and would time out 
// with some longer input values (like base64 encoded values)
emailRegex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)

// List of possible names/ids for fields
emailNames = ['email','session[username_or_email]']
passwordNames = ['password']
usernameNames = ['username','session[username_or_email]']

// Loop through all of the inputs on the page
inputs = document.getElementsByTagName('input');
for (index = 0; index < inputs.length; ++index) {

    // Gather some data
    input = inputs[index]
    type = input.type
    val = input.value
    name = input.name
    id = input.id

    // Determine if this is a password, email, or username
    if (val) {
        if (type === 'password' || passwordNames.includes(name) || passwordNames.includes(id)) {
            values.push({
                type: 'password',
                value: val
            })
        }
        else if ((type === 'email' || emailNames.includes(name) || emailNames.includes(id)) && emailRegex.test(val)) {
            values.push({
                type: 'account',
                value: val
            })
        }
        else if (usernameNames.includes(name) || usernameNames.includes(id)) {
            values.push({
                type: 'account',
                value: val
            })
        }
        else if (emailRegex.test(val)) {
            values.push({
                type: 'account',
                value: val
            })
        }
    }

}

// Send the found values back to the popup
chrome.runtime.sendMessage(values)
