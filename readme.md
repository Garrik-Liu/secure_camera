# Introduction:

Safety is important for everythings.  Surveillance camera is commonly used for keeping the safety of areas, such as room or office.  They are usually installed in the corner of the ceiling, transmit video signal to a set of monitors through cables.  This type of surveillance camera is commonly seen in our daily life, however, it is not convenient for home use.  

Nowadays, the internet is everywhere in our life.  It breaks the limitation of distance, and improves the efficiency of communication.  We propose to design a internet-based home surveillance system, it comprises a surveillance camera device, a cloud server, and a web app.  This system allows users to remotely monitor their home through the web app that opened in their phone or pc.  Users can be anywhere, as long as the camera that set in their home is connected to internet, they are allowed to use web app monitor their home.

![](https://github.com/Garrik-Liu/secure_camera/raw/master/project_diagram.png)

# Product Requirements (“Home Surveillance and Security System”): 
* The ultrasonic sensor can detect if there is any people who appears in the monitored area.  
* The camera will take a picture and send to cloud server, if there is any people appears.
* The cloud server can recognize the identity of people who shown in the picture.  
* The cloud server will send pictures that received from camera to users’ web app.
* Users can use web app to monitor their home in real time. 


# Product Specifications (“Home Surveillance and Security System”): 
* Using SM41-CNF to be the camera.
* Using HC-SR04 to be the ultrasonic sensor.
* Using Raspberry Pi Model B to control the camera and ultrasonic sensor
* Google Cloud Server is used to be the server.
* Cloud Server uses Google Cloud Vision API to recognize faces.
* Users are able to use browser to use Web App
* Cloud Server sends picture that received from raspberry pi to web app, and people’s identities will be shown on web app at the same time.
* HTTP is used to be the communication protocol between cloud server, browser, and raspberry pi.
* Cloud server, browser, and raspberry pi connect to Internet all the time.


