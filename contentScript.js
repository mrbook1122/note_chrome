// chrome.runtime.sendMessage({greeting: 'hello'}, resp => {
//     console.log('send success')
//     localStorage.setItem('bo', 'test')
// })

//获取当前tab页
// chrome.tabs.getCurrent(tab => {
//
//     chrome.desktopCapture.chooseDesktopMedia(['tab'], tab.id, stream => {
//         console.log(stream)
//         chrome.runtime.sendMessage({stream: stream}, resp => {
//             console.log('send stream success')
//         })
//     });
//
// })

let videoDB
let videoRequest = indexedDB.open('db', 1)
videoRequest.onerror = () => {
    console.log('failed to open database')
}
videoRequest.onsuccess = () => {
    videoDB = videoRequest.result
}
videoRequest.onupgradeneeded = ev => {
    let db = ev.target.result;
    let objectStore = db.createObjectStore('videos', {keyPath: 'id', autoIncrement: true});
    objectStore.createIndex('webm', '', {unique: false});
}

let tabRecorderButton = document.getElementById('tabRecorderButton')
let tabRecorder
let tabRecorderData = []
let tabRecorderState = 0
let intervalId;

function storeVideo(data) {
    let newItem = {webm: data}
    let objectStore = videoDB.transaction(['videos'], 'readwrite').objectStore('videos');
    let request = objectStore.add(newItem)
}

tabRecorderButton.onclick = () => {
    if (tabRecorderState === 0) {
        if (!tabRecorder) {
            chrome.runtime.sendMessage({msg: 'start'}, resp => {
                if (!(resp.msg === 'ok'))
                    return;
                navigator.mediaDevices.getUserMedia({
                    video: {
                        mandatory: {
                            chromeMediaSource: 'tab',
                            chromeMediaSourceId: resp.stream,
                        }
                    }
                })
                    .then(stream => {
                        tabRecorder = new MediaRecorder(stream, {
                            videoBitsPerSecond: 2500000
                        })
                        tabRecorder.ondataavailable = e => {
                            tabRecorderData.push(e.data)
                            let blob = new Blob(tabRecorderData, {type: 'video/webm'})
                            // let video = document.getElementById('video')
                            // video.src = URL.createObjectURL(blob)
                            storeVideo(blob)
                        }
                        tabRecorder.start()
                        // 当点击停止共享屏幕时，停止捕获屏幕
                        // stream.getTracks().map(track => {
                        //     track.onended = () => {
                        //         tabRecorderButton.click()
                        //     }
                        // })

                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
        } else {
            tabRecorder.start()
        }
        tabRecorderState = 1;
        tabRecorderButton.style.backgroundColor = 'red'
        let time = 0
        intervalId = setInterval(() => {
            time++;
            tabRecorderButton.textContent = time;
        }, 1000)
    } else {
        clearInterval(intervalId)
        tabRecorderButton.textContent = '录 屏';
        tabRecorderButton.style.backgroundColor = '#1890ff'
        tabRecorderData = []
        tabRecorderState = 0;
        tabRecorder.stop();

    }
}

let desktopRecorderButton = document.getElementById('desktopRecorderButton')
let desktopRecorder
let desktopRecorderData = []
let desktopRecorderState = 0
let desktopIntervalId;

desktopRecorderButton.onclick = () => {
    if (desktopRecorderState === 0) {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                width: 1920,
                height: 1080,
                displaySurface: 'monitor'
            }
        }).then(stream => {
            desktopRecorder = new MediaRecorder(stream)
            desktopRecorder.ondataavailable = e => {
                desktopRecorderData.push(e.data)
                let blob = new Blob(desktopRecorderData, {type: 'video/webm'})
                // let video = document.getElementById('video')
                // video.src = URL.createObjectURL(blob)
                storeVideo(blob)
            }
            // 当点击停止共享屏幕时，停止捕获屏幕
            stream.getTracks().map(track => {
                track.onended = () => {
                    desktopRecorderButton.click()
                }
            })
            desktopRecorder.start()
        }).catch(err => {
            console.log('取消录屏')
            return;
        })
        desktopRecorderState = 1;
        desktopRecorderButton.style.backgroundColor = 'red'
        let time = 0
        desktopIntervalId = setInterval(() => {
            time++;
            desktopRecorderButton.textContent = time;
        }, 1000)
    } else {
        clearInterval(desktopIntervalId)
        desktopRecorderButton.textContent = '录 屏';
        desktopRecorderButton.style.backgroundColor = '#1890ff'
        desktopRecorderData = []
        desktopRecorderState = 0;
        desktopRecorder.stop();
        desktopRecorder.stream.getTracks().map(item => {
            item.stop()
        })
    }
}

let videoRecorderButton = document.getElementById('videoRecorderButton')
let videoRecorder
let videoRecorderData = []
let videoRecorderState = 0
let videoIntervalId;

videoRecorderButton.onclick = () => {
    if (videoRecorderState === 0) {
        if (!videoRecorder) {

        } else videoRecorder.start()
    }
}

let cutButton = document.getElementById('cut')
cutButton.onclick = () => {
    chrome.runtime.sendMessage({msg: 'cut'}, resp => {
        console.log(resp)
    })
}