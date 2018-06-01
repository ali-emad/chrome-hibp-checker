// Called when the popup is opened
document.addEventListener('DOMContentLoaded', () => {

    let error = document.querySelector('.error')
    let warning = document.querySelector('.warning')
    let results = document.querySelector('.results')
    let pwned = document.querySelector('.pwned')
    let safe = document.querySelector('.safe')

    // Listen for a message from the injected script
    chrome.runtime.onMessage.addListener(function(message, sender) {
        if (message.length) {
            for (x in message) {

                // Determine the API URL based on type
                let url = 'https://haveibeenpwned.com/api/v2/'
                if (message[x].type === 'account') {
                    url += 'breachedaccount/' + message[x].value
                }
                else {
                    url += 'pwnedpassword/' + message[x].value
                }

                // Make a request to the API
                http(url, message[x], (success, message, data) => {
                    // Success means this item was breached
                    if (success) {
                        let newHtml = '<div class="item"><div class="value">' + (message.type==='password'?message.value.replace(/./g, '*'):message.value) + ' (' + message.type + ')</div>'

                        if (message.type === 'account') {
                            newHtml += '<div class="breaches">'
                            for (i in data) {
                                breach = data[i]
                                newHtml += '<p><strong>' + breach.Title + ' (' + breach.Domain + ' / ' + breach.BreachDate + ')</strong>' + breach.Description + '</p>'
                            }
                            newHtml += '</div>'
                        }

                        newHtml += '</div>'
                        pwned.className = 'pwned show'
                        pwned.innerHTML = pwned.innerHTML + newHtml
                    } else { // Not breached
                        safe.innerHTML = safe.innerHTML + '<div class="item"><p>' + (message.type==='password'?message.value.replace(/./g, '*'):message.value) + ' (' + message.type + ')</p></div>'
                        safe.className = 'safe show'
                    }
                })

                // Avoid rate limiting
                sleep(100)
            }

            results.className = 'results show'
        } else {
            warning.innerText = 'Could not find any credentials on the page'
            warning.className = 'warning show'
        }
    })

    // Listen for search button click
    document.getElementById('search').addEventListener('click', () => {
        // Execute a script on the current tab that grabs all usernames/emails/passwords it can find
        chrome.tabs.executeScript(null, {
            file: "check.js"
        }, function() {
            // Display an error if there was one
            if (chrome.runtime.lastError) {
                error.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message
                error.className = 'error show'
            }
        })
    })
})

function http (url, message, cb) {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.onload = function () {
        cb(
            xhr.status===200, 
            message, 
            (xhr.responseText.length?JSON.parse(xhr.responseText):{})
        )
    };
    xhr.send(null)
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}