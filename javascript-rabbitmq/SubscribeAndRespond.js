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

/**
 * The username as defined in your atomit dashboard
 */
var username = "demo";
/**
 * The password as defined in your atomit dashboard
 */
var password = "demo";
/**
 * Your appEUI as found in your atomit dashboard
 */
var app_eui = "70B3D57ED000054E";
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

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://' + app_eui + "_" + username + ':' + password + '@' + host + '/' + vhost, function (err, conn) {
    conn.createChannel(function (err, ch) {
        /**
         * Create a temporary queue that will be deleted after connection is closed
         */
        ch.assertQueue('', {exclusive: true}, function (err, q) {
            /**
             * We now have to bind the queue to what we want to receive.
             * 
             * Messages are published under devEUI/type
             * devEUI is the full devEUI in case of OTAA (ex: AAABACADAEAFBABB), 0-padded in the case of ABP (ex: 00000000AAABACAD)
             * type is up, down, or activations
             * 
             * Valid filters: [1].[2] 
             * [1] can be the deviceEUI or * for all devices
             * [2] can be type or * for all types
             */
            ch.bindQueue(q.queue, app_eui, dev_eui+'.up');

            /**
             * We can finally start subscribtion and process messages
             */

            ch.consume(q.queue, function (msg) {
                console.log("Received a message : %s", msg.content.toString());
                
                var message = '{'
                + '"payload": "c2FsdXQ=",'
                + '"port": 1,'
                + '"ttl": "1h"'
                + '}';
                
                ch.publish(app_eui, dev_eui + ".down", new Buffer(message));
                
                console.log("Response sent!");
            }, {noAck: true});
        });
    });
});