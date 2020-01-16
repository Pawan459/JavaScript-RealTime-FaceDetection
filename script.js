const video = document.getElementById('video')

startVideo = () =>{
    navigator.getUserMedia(
        {
            video : {}
        },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

video.addEventListener('play',()=>{
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {
        width : video.width,
        height : video.height
    }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () =>{
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptors()
            .withAgeAndGender()


        const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
        )

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        resizedDetections.forEach(result => {
            const { age, gender, genderProbability } = result
            new faceapi.draw.DrawTextField(
                [
                    `${Math.round(age, 0)} years`,
                    `${gender} (${Math.round(genderProbability)})`
                ],
                result.detection.box.bottomRight
            ).draw(canvas)
        })

        faceapi.draw.drawDetections(canvas, resizedDetections)

        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

        faceapi.draw.drawFaceExpressions(canvas, resizedDetections) 
    }, 100)
})

Promise.all(
    [
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/models')
    ]
).then(startVideo)

