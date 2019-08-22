chrome.browserAction.onClicked.addListener(tab => {
    console.log('d')

    chrome.windows.create({
        type: 'popup',
        tabId: tab.id
    })
    chrome.windows.create({
        url: 'index.html',
        type: 'popup',
        focused: true,
        left: 1000
    })
    chrome.tabs.executeScript(tab.id, {
        file: 'contentScript.js'
    })
})