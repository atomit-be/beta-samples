/*
 * The MIT License
 *
 * Copyright 2016 honorem.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var amqp = require('amqplib/callback_api');

/**
 * The username as defined in your atomit dashboard
 */
var username = 'demo';
/**
 * The password as defined in your atomit dashboard
 */
var password = 'demo';
/**
 * Your appEUI as found in your atomit dashboard
 */
var app_eui = '70B3D57ED000054E';
/**
 * Your devEUI as found in your atomit dashboard
 */
var dev_eui = '0000000033152A74';
/**
 * For now, the VHost to use will always be "beta"
 */
var vhost = 'beta';
/**
 * The atomit rabbitmq cluster address
 */
var host = 'api.beta.atomit.be';

/**
 * The real username is appEUI_username:
 */
amqp.connect('amqp://' + app_eui + "_" + username + ':' + password + '@'+host+'/' + vhost, function (err, conn) {

    conn.createChannel(function (err, ch) {
        var q = dev_eui + '.down';

        var message = '{'
                + '"payload": "c2FsdXQ=",'
                + '"port": 1,'
                + '"ttl": "1h"'
                + '}';

        /**
         * Send our message
         */

        ch.publish(app_eui, q, new Buffer(message));

        console.log("Message sent!");
    });

    setTimeout(function () {
        conn.close();
        process.exit(0)
    }, 500);
});

