import {AutoComplete, Button, Cascader, Checkbox,
    Col, Form, Input, InputNumber, Row, Select,message} from 'antd'
import React, { useState } from 'react'
import 'antd/dist/antd.css'
import axios from 'axios'
import {history} from '@@/exports'


// 定义message提示框的存驻时间
message.config({
    duration: 1.5
})

// 定义注册栏的条框大小
const formItemLayout = {
    labelCol: {
        xs: { span: 16 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 16 },
        sm: { span: 10 },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 16,
            offset: 6,
        },
        sm: {
            span: 12,
            offset: 6,
        },
    },
};


export default function register() {
    return (
        <Form
            {...formItemLayout}
            name="register"
            onFinish={item => {
                // 弹框
                const hide = message.loading('正在注册中...', 0)

                // 发送请求给服务器
                axios
                    .post('http://127.0.0.1:5000/regist', item)
                    .then(res => {
                        // 隐藏弹框
                        hide()

                        // 显示服务器返回的信息
                        if (res.data.code) { // 错误
                            message.error(res.data.msg)
                        } else { // 成功
                            message.success(res.data.msg)
                            // 跳转到下一个页面（登录页面）
                            history.push('/login')
                        }
                    })
                    .catch(err => {
                        // 隐藏弹框
                        hide()

                        // 显示错误信息
                        message.error(err.message)
                    })
            }

            }
            scrollToFirstError
        >
            <Form.Item
                name="email"
                label="E-mail"
                rules={[
                    {
                        type: 'email',
                        message: '这不是一个有效的E-mail邮箱!',
                    },
                    {
                        required: true,
                        message: '请输出你的E-mail邮箱!',
                    }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="password"
                label="Password"
                rules={[
                    {
                        required: true,
                        message: '请输入你的密码!',
                    }
                ]}
                hasFeedback
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: '请确认您的密码!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次输入的密码不一致!'));
                        },
                    })
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="nickname"
                label="Nickname"
                tooltip="想要其他人如何称呼您?"
                rules={[{ required: true, message: '请输入您的用户名!', whitespace: true }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: '请输入您的电话号码!' },
                    {
                        required: false,        //在用户输入了内容后，再进行此项验证，所以要设为false
                        pattern: new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/, "g"),
                        message: '请输入正确的手机号'
                    }
                    ]}>
                <Input  />
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Register
                </Button>
            </Form.Item>
        </Form>
    )
}