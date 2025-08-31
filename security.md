# Configuring security

By default wiki will, if we don't configure a security module, make all content read-only.

The previous default where unclaimed sites were editable by anybody can be enabled by setting `security_legacy` to true.

This version of wiki will install

- a [Passport](http://passportjs.org) based security module, see [wiki-security-friends](https://github.com/fedwiki/wiki-security-passportjs/blob/master/ReadMe.md), and
- a simpler _friends_, secret token, based security module, see [wiki-security-friends](https://github.com/fedwiki/wiki-security-friends/blob/master/README.md) for details.

To use this new, Passport based, security module you will need to choose one of the OAuth providers that it makes available and follow the [configuration notes](https://github.com/fedwiki/wiki-security-passportjs/blob/master/docs/configuration.md).

It is recommended that you make use of _TLS_, many OAuth providers now require it. This will require configuring a proxy, in front of the Federated Wiki server, and getting the necessary certificated. There are a number of options, probably the easiest is to use [Caddy](https://caddyserver.com/) with [Automatic HTTPS](https://caddyserver.com/docs/automatic-https), and On-Demand TLS. Which uses [Let's Encrypt](https://letsencrypt.org/) as the certificate authority.

If you want to use `TLS` you will need to configure the wiki server by adding `"security_useHttps": true,` to the configuration file, as well as using `https://` in the callback URLs when you configure the OAuth provider.

**WARNING:** If you are using localhost subdomains. Cookies are handled differently, which means SSO across subdomains will not work. While this is only likely to affect those developing security schemes, it is something to be aware of. Consider either using one of your own domains and pointing a subdomain to `127.0.0.1` and `::1`, or a domain like `localtest.me` that points to localhost _see [localtest-dot-me (github)](https://github.com/localtest-dot-me/localtest-dot-me.github.com). If using a publicly provided test DNS, it is wise to check it still points to the expected place._
