# Kcals

A minimalist Slack cli for when you don't want to quit your terminal to send one message.

![Kcals](https://raw.githubusercontent.com/romainberger/kcals/master/kcals.gif)

## Installation

```shell
$ npm i -g kcals
```

On the first use, Kcals will ask you a token, generate one here: [https://api.slack.com/custom-integrations/legacy-tokens](https://api.slack.com/custom-integrations/legacy-tokens).

## Usage

```shell
$ kcals
```

You can also give the receiver and message directly (work in progress to improve this):

```shell
$ kcals @romain hello how are you
```

or simply give the receiver:

```shell
$ kcals @romain
```

## Todo

- check for new version every once in a while and display a short message
- fix config file creation (use ink)
- improve usage with arguments

## License

MIT
