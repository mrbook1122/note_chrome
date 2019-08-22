chrome.runtime.sendMessage({greeting: 'hello'}, resp => {
    console.log('send success')
})