<?php

/*
 * The MIT License
 *
 * Copyright 2016 cambierr.
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

require_once __DIR__ . '/vendor/autoload.php';

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

/**
 * Your appEUI as found in your atomit dashboard
 */
define('appEUI', "70B3D57ED000054E");
/**
 * The username as defined in your atomit dashboard
 */
define('username', "demo");
/**
 * The password as defined in your atomit dashboard
 */
define('password', "demo");
/**
 * Your devEUI as found in your atomit dashboard
 */
define('devEUI', "0000000033152A74");
/**
 * The real username is appEUI_username:
 */
$connection = new AMQPStreamConnection('api.beta.atomit.be', 5672, appEUI . '_' . username, password, 'beta');
$channel = $connection->channel();

/**
 * Create a temporary queue that will be deleted after connection is closed
 */
$queue = $channel->queue_declare()[0];

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
$channel->queue_bind($queue, appEUI, "*.up");

$callback = function($msg) use ($channel){
    echo "Received a message : ", $msg->body, "\n";
    
    $message = "{\"payload\": \"c2FsdXQ=\",\"port\": 1,\"ttl\": \"1h\"}";
    $channel->basic_publish(new AMQPMessage($message), appEUI, devEUI . '.down');
    echo "Response sent!\n";
};

/**
 * We can finally start subscribtion and process messages
 */
$channel->basic_consume($queue, '', false, true, false, false, $callback);

while (count($channel->callbacks)) {
    $channel->wait();
}
