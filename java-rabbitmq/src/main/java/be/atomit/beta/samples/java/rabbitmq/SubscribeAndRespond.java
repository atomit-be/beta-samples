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
package be.atomit.beta.samples.java.rabbitmq;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;
import java.io.IOException;

/**
 *
 * @author cambierr
 */
public class SubscribeAndRespond {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws Exception {
        /**
         * Your appEUI as found in your atomit dashboard
         */
        String appEUI = "70B3D57ED000054E";
        /**
         * Your devEUI as found in your atomit dashboard
         */
        String devEUI = "0000000033152A74";
        /**
         * The username as defined in your atomit dashboard
         */
        String username = "demo";
        /**
         * The password as defined in your atomit dashboard
         */
        String password = "demo";
        

        ConnectionFactory factory = new ConnectionFactory();
        /**
         * The atomit rabbitmq cluster address
         */
        factory.setHost("api.beta.atomit.be");
        /**
         * For now, the VHost to use will always be "beta"
         */
        factory.setVirtualHost("beta");
        /**
         * The real username is appEUI_username:
         */
        factory.setUsername(appEUI + "_" + username);
        factory.setPassword(password);

        Connection connection = factory.newConnection();
        System.out.println("Connected to atomit rabbitMQ cluster !");
        
        Channel channel = connection.createChannel();

        /**
         * Create a temporary queue that will be deleted after connection is closed
         */
        String q = channel.queueDeclare().getQueue();
        
        /**
         * We now have to bind the queue to what we want to receive.
         */
        channel.queueBind(q, appEUI, devEUI+".up");
        
        /**
         * We can finally start subscribtion and process messages
         */
        channel.basicConsume(q, new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String _consumerTag, Envelope _envelope, AMQP.BasicProperties _properties, byte[] _body) throws IOException {
                System.out.println("Received a message : " + new String(_body));
                
                String message
                        = "{"
                        + "\"payload\": \"c2FsdXQ=\","
                        + "\"port\": 1,"
                        + "\"ttl\": \"1h\""
                        + "}";
                
                channel.basicPublish(appEUI, devEUI + "." + "down", null, message.getBytes());
                
                System.out.println("Response sent!");
            }
        });
    }
    
}
