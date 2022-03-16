#!/usr/bin/env python3
# http: // zetcode.com/python/requests/
# https://requests.readthedocs.io/en/master/user/quickstart/
#
# use `pip3 install requests` if you don't have python requests installed

# chmod +x ptzserver.py
# Execute via ./ptzserver.py. # or python3 ptzserver.py
# In OBS:
#   Add a browser Source with a url like http://localhost:8080/?preset=5
#   Check the box 'Refresh Browser when source becomes active'
#   Put the browser behind all other content
#
# Note that if you add more than one browser to a Scene, the PTZ for the browser will
# take effect if you turn it on and off, allowing toggling zoom within a scene.
#

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import requests
import json
import hashlib
from requests.auth import HTTPBasicAuth
from requests.auth import HTTPDigestAuth

hostName = "" #"localhost"
serverPort = 8080

host_sessions={}

DefaultCam = 'South'

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        args = parse_qs(urlparse(self.path).query)
        preset = args.get("preset", ["1"])[0]
        action = args.get("action", ["start"])[0]
        code = args.get("code", ["GotoPreset"])[0]
        arg2 = args.get("arg2", [preset])[0]
        if preset == None:
            self.send_response(400)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(
                bytes("<html>Missing argument: preset.  Use something like 'http://localhost:"+str(serverPort)+"/?preset=5'</html>", "utf-8"))
            return

        cam = args.get("cam", None)
        if cam == None:
            cam = [DefaultCam]
            return

        camip=args.get("camip",None)
        if camip == None:
            print("camip argument missing")
            return

        camuser=args.get("camuser",None)
        if camuser == None:
            print("camuser argument missing")
            return

        campw=args.get("campw",None)
        if campw == None:
            print("campw argument missing")
            return


        try:
            cam = cam[0]
            host = "http://"+camip[0]
            camuser = camuser[0]
            campw = campw[0]
                

            if host == None:
                self.send_response(400)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(
                    bytes("<html>Unable to find address for "+str(cam)+"</html>", "utf-8"))
                return

            session = host_sessions.get(cam,None)
            if session == None:
                host_sessions[cam] = session = requests.Session()

            url = host+'/cgi-bin/ptz.cgi?action='+action+'&channel=1&code='+code+'&arg1=0&arg2=' + \
                str(arg2) + '&arg3=0'
            print("url=",url)
            print("host=",host," preset=",preset)
            resp = session.get(url,
                               auth=HTTPDigestAuth(camuser, campw),
                               timeout=2.000)
            self.send_response(200)
            if (resp.status_code != 200):
                print(resp)
                
        except Exception as e:
            print ("Exception")
            print(str(e))
            self.send_response(500)

        self.send_header("Content-type", "text/html")
        self.end_headers()
        # Always send blank content so it never shows in OBS
        self.wfile.write(
            bytes("<html><body><body></html>", "utf-8"))


if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
