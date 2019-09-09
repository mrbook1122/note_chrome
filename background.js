chrome.browserAction.onClicked.addListener(tab => {
    console.log('d')

    let width = tab.width / 2 - 5
    let height = tab.height + 1000
    
    chrome.windows.create({
        type: 'popup',
        tabId: tab.id,
        width: width,
        height: height,
        left: 5
    })
    chrome.windows.create({
        url: 'index.html',
        type: 'popup',
        focused: true,
        width: width,
        left: width + 15,
        height: height
    })
    console.log(width)
    chrome.tabs.executeScript(tab.id, {
        file: 'contentScript.js'
    })
})