
# django-home-appliances-webapp

This is a remote control web application server for home appliances.  
This project is primarily for testing and practical use of the MQTT-based device bridge and control processor for the residential central air conditioner manufactured by Toshiba Carrier Corporation (indoor unit: NTS-F1403Y1 equipped with MCC-1403 PC board), no other devices are currently supported.  
It is built on top of the Django web application framework and uses Django Channels for real-time WebSocket communication between the server and user clients.  
Communication between the Django Channels and the HA devices (currently just one air conditioner) is handled by a MQTT-Django bridge included as a custom django-admin command.  
The device implementation for the Toshiba air conditioner that works with this project is [here](https://github.com/burrocargado/toshiba-aircon-mqtt-bridge).  
For the Toshiba air conditioner, a packet processing server that handles binary packets to control the indoor unit is implemented separately and included in this project as a submodule.  
The web application of this project is designed to work as a Progressive Web App (PWA) as well as a normal website. For the site to work as a PWA, it is necessary to run the site over HTTPS.

This project uses the following packages as Docker Compose services:

- Nginx as a web server to serve static files and as a proxy for the Django application (Service: nginx)
- Uvicorn and Gunicorn for the ASGI-compliant application server (Service: app)
- Django-Q to execute scheduled commands (Service: django-q)
- Redis as a backend for Django Channels and Django-Q (Service: redis)
- Mosquitto as a MQTT broker (Service: mosquitto)
- HTTPS-PORTAL to run the site over HTTPS using a certificate provided by Let's Encrypt (Service: tlsgw)

Other services in the docker-compose.yaml:

- bridge: MQTT-Django bridge
- worker: Channels worker to run the MqttConsumer
- tapp: Packet processing server for Toshiba air conditioner (NTS-F1403Y1)

## Installation

### Prerequisite

- Linux machine with Docker Engine installed  
  The project has been tested to work on the following environment:
  - x64 PC running Ubuntu 20.04
  - Docker Engine 23.0.1
  - Docker Compose plugin v2.16.0

### Clone the project

```shell
git clone --recursive https://github.com/burrocargado/django-home-appliances-webapp
```

or

```shell
git clone https://github.com/burrocargado/django-home-appliances-webapp
cd django-home-appliances-webapp
git submodule update --init --recursive
```

### Build the Docker images

Before configuration, it is necessary to build the image defined in the service "app".
To build the images, create an empty file ```tlsgw.env```, without this file the build will fail.

```shell
touch tlsgw/tlsgw.env
docker compose build
```

### Configuration

- Prepare TLS certificates for the MQTT broker and clients.  
  (Refer to the documentation for OpenSSL or other tools.)
  - Create a Certificate Authority (CA) to sign certificates.  
    The CA certificate is available once the CA is prepared, save as ```cacert.pem```.
  - Generate a server certificate and private key for the MQTT broker and save them as broker.crt and broker.key, respectively.
  - Generate three pairs of client certificate and private key for the bridge, processor, and device, and save them as three pairs of ```client.crt``` and ```client.key``` in separate folders.
- Mosquitto configurations:
  - Create a password file
    - Copy ```mqtt/mosquitto.passwd.example``` to ```mqtt/mosquitto.passwd```.
    - Edit the file to set three username:password pairs for device, bridge, and processor.
    - Copy the file to ```mqtt/secrets/``` and then hash the passwords:

      ```shell
      cd mqtt
      ./hashpw.sh
      ```

      Leave the ```mqtt/mosquitto.passwd``` file unhashed so that you can reference the credentials later.
  - Place ```cacert.pem```, ```broker.crt```, ```broker.key``` in ```mqtt/secrets/```.
  - Create ```mqtt/config/mosquitto.acl``` referencing ```mqtt/config/mosquitto.acl.example```.
- Configure the device to use one of the ```client.crt``` and ```client.key``` pairs and the ```cacert.pem```.
- Place another pair of ```client.crt``` and ```client.key``` in ```bridge/secrets/``` and edit ```bridge/secrets/biridge.conf``` with reference to ```bridge/secrets/bridge.conf.example```.
- Place yet another pair of ```client.crt``` and ```client.key``` in ```proc/tapp_secrets/```.
- Create ```proc/tapp_secrets/mqtt.conf``` referencing ```proc/tapp_secrets/mqtt.conf.example```.
- Create ```django/secrets/env```
  - Remove ```django/secrets/env``` if present.
  - Generate ```django/secrets/env```, which contains the Django secret key, as follows:

    ```shell
    cd django
    ./make_secretenv.sh
    ```

  - Edit ```django/secrets/env``` by referencing ```django/secrets/env.example```.
- Edit ```tlsgw/tlsgw.env``` referencing ```tlsgw/tlsgw.env.example```.  
  For the HTTPS-PORTAL to work in staging or production mode, the Docker service "tlsgw" must be accessible by the officially registered FQDN through the ports 443 (TLS) and 80 (HTTP) exposed to the Internet. I'm using HAProxy to route incoming traffic to the tlsgw ports. The FQDN should be configured in ```tlsgw/tlsgw.env```. You should also configure your local DNS server so that the FQDN points to the IP address of the server, otherwise the client address detected by the Django will be replaced by the global IP address assigned by your ISP and WHITE_LISTED_RANGES will not work.

### Run the Docker containers

```shell
docker compose up -d
```

To create a superuser, who can access the admin site:

```shell
docker compose run --rm app python3 manage.py createsuperuser
```

## Usage

Open ```https://server.domain.tld/hawebapp/``` with a web browser. If you wish, install the application as a PWA.  
If you are accessing the application from the local network defined as WHITE_LISTED_RANGES in ```django/secrets/env```, no user authentication is required. Otherwise, login is required.
User accounts are created from the admin site ```https://server.domain.tld/hawebapp/admin/```.  
Internationalization is implemented with Japanese translation.
If the browser language is set to Japanese in the preferences, the site will be displayed in Japanese.  
Web accessibility implementation is incomplete or incorrect.

### Screenshot

Screen shot of the Chrome browser with the developer tool accessing the application:

![client screen capture](screen_capture.gif)
