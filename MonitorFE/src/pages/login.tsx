import {Button, Form, Input, message} from 'antd'
import 'antd/dist/antd.css'
import axios from 'axios'
import styles from './login.less'
import {history} from '@@/exports'

message.config({
  duration: 1.5
})

export default function Login() {
  return (
    <div className={styles.box}>
      <Form
        name="basic"
        labelCol={{span: 8}}
        wrapperCol={{span: 16}}
        initialValues={{remember: true}}
        onFinish={item => {
          // 弹框
          const hide = message.loading('正在登录中...', 0)

          // 发送请求给服务器
          axios
            .post('http://127.0.0.1:5000/login', item)
            .then(res => {
              // 隐藏弹框
              hide()

              // 显示服务器返回的信息
              if (res.data.code) { // 错误
                message.error(res.data.msg)
              } else { // 成功
                message.success(res.data.msg)
                // 将token存储到本地
                localStorage.setItem('token', res.data.data.token)
                // 跳转到下一个页面（主页面）
                history.push('/main')
              }
            })
            .catch(err => {
              // 隐藏弹框
              hide()

              // 显示错误信息
              message.error(err.message)
            })
        }}
        style={{
          margin: 20
        }}
      >
        <Form.Item
          label="邮箱"
          name="E-mail"
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
          <Input/>
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{required: true, message: '请输入密码'}]}
        >
          <Input.Password/>
        </Form.Item>

        <Form.Item wrapperCol={{offset: 8, span: 16}}>
          <Button className={styles.login_btn} type="primary" htmlType="submit">
            登录
          </Button>
            Or <a href='/register'>现在注册!</a>
        </Form.Item>
      </Form>
    </div>
  )
}
