let leftId;
let rightId;

chrome.browserAction.onClicked.addListener(tab => {
    console.log('d')

    chrome.windows.create({
        type: 'popup',
        tabId: tab.id,
        state: 'maximized'
    }, window => {
        let width = window.width
        let height = window.height - 10

        leftId = tab.id

        chrome.tabs.executeScript(window.tabs[0].id, {
            file: 'main.js'
        })

        chrome.windows.create({
            type: 'popup',
            url: 'http://localhost:3000',
            width: width / 2,
            height: height,
            left: width / 2 + 5,
            top: 0,
            focused: true
        }, win => {
            rightId = win.tabs[0].id;
            chrome.tabs.executeScript(win.tabs[0].id, {
                file: 'contentScript.js'
            })
        })
        chrome.windows.update(window.id, {
            left: 0,
            top: 0,
            width: width / 2,
            height: height
        })
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
    console.log(message)

    // chrome.desktopCapture.chooseDesktopMedia(['tab'], sender.tab, stream => {
    //     if (stream)
    //         sendResp({msg: 'ok', stream: stream})
    //     else sendResp({msg: 'error'})
    // })
    //
    // return true
    // sendResp({hello: 'a'})
    if (message.msg === 'start') {
        chrome.tabCapture.getMediaStreamId({
            consumerTabId: rightId,
            targetTabId: leftId
        }, stream => {
            if (stream)
                sendResp({msg: 'ok', stream: stream})
            else sendResp({msg: 'error'})
        })
        return true;
    } else if (message.msg === 'cut') {
        chrome.tabs.sendMessage(leftId, {msg: 'cut'}, resp => {
            if (resp)
            sendResp({data: resp.data})
        })
        return true
    }
})

// chrome.runtime.sendMessage({msg: 'hello from app'}, resp => {
//     console.log('send success')
// })
//
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log(message)
// })