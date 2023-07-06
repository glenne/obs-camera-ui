# OBS Amcrest Control

## Links

- [OBS Remote API](https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md)
- [OBS Remote JS](https://github.com/haganbmj/obs-websocket-js)

## Getting Started

1. [Install Brew](https://brew.sh/)
2. Install via the OBS Websocket plugin `brew install obs-websocket`
2. Configure the websocket plugin via OBS/Tools/Websocket Server Settings
3. Match OBS server settings to the config.json file

## Build Tools

1. Install Visual Studio Code to edit
2. Install [nvm](https://github.com/nvm-sh/nvm) to manage npm install
3. Install npm with nvm: `nvm install --lts`
4. Install yarn: `npm install --global yarn`

## Build and Install

1. Update node_modules: `yarn install`
2. Make installer in build directory: `yarn build`
3. Install to ~/Sites/obs-amcrest: `yarn deploy`

## Apache Server Setup

- [Enabling MacOS apache](https://discussions.apple.com/docs/DOC-3083)

For the contents of the /etc/apache2/users/glenne.conf file, use the following:

```
<Directory "/Users/glenne/Sites/">
  AddLanguage en .en
  Options Indexes MultiViews FollowSymLinks ExecCGI
  AllowOverride All
  Require all granted
</Directory>
```

Be sure to edit /private/etc/apache2/extra/httpd-userdir.conf and enable the *.conf include.

The following was needed on one machine:

- [Enable MacOS apache perms](https://wpbeaches.com/forbidden-403-you-dont-have-permission-to-access-username-on-this-server/)
