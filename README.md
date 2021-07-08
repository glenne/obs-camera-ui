# OBS Amcrest Control

## Getting Started

1. [Install Brew](https://brew.sh/)
2. Install via the OBS Websocket plugin `brew install obs-websocket`
2. Configure the websocket plugin via OBS/Tools/Websocket Server Settings
3. Match OBS server settings to the config.json file
4. `yarn build` to make an independant installer

## Links

- [OBS Remote API](https://github.com/Palakis/obs-websocket/blob/4.x-current/docs/generated/protocol.md)
- [OBS Remote JS](https://github.com/haganbmj/obs-websocket-js)

## Apache Server Setup

- [Enabling MacOS apache](https://discussions.apple.com/docs/DOC-3083)

For the contents of the /etc/apache2/users/glenne.conf file, use the following:

```
<Directory "/Users/glenne/Sites/">
  AddLanguage en .en
  AddHandler perl-script .pl
  PerlHandler ModPerl::Registry
  Options Indexes MultiViews FollowSymLinks ExecCGI
  AllowOverride All
  Require all granted
</Directory>
```

The following was needed on one machine:

- [Enable MacOS apache perms](https://wpbeaches.com/forbidden-403-you-dont-have-permission-to-access-username-on-this-server/)
