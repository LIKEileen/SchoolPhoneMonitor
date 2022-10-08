import {Button, Image, message, Modal, Space, Table} from 'antd'
import {CameraOutlined, LogoutOutlined, ScanOutlined} from '@ant-design/icons'
import styles from './main.less'
import {useEffect, useState} from 'react'
import {history} from '@@/exports'
import axios from 'axios'

export default function Main() {
  // 定义一个表格数据状态
  const [rows, setRows] = useState([])

  // 加载表格数据
  function loadRows() {
    // 加载所有的事件数据
    axios
      .get('http://127.0.0.1:5000/event', {
        headers: {
          Token: localStorage.getItem('token') + ''
        }
      })
      .then(res => {
        if (res.data.code) { // 说明请求有问题
          console.log(res.data)
          return
        }

        setRows(res.data.data)
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => { // 当组件加载完毕时，会调用一次
    // 判断用户是否有存储token
    const token = localStorage.getItem('token')
    if (token) {
      loadRows()
      return
    }

    // 用户没有存储token
    message.error('请重新登录')
    history.push('/login')
  }, [])

  // 定义一个字符串状态
  const [data, setData] = useState('')

  const columns = [
    {
      title: 'id',
      dataIndex: 'id'
    },
    {
      title: '图片',
      dataIndex: 'image',
      render: (v: any) => {
        return <Image
          height={50}
          src={v}
        />
      }
    },
    {
      title: '时间',
      dataIndex: 'create_time'
    },
    {
      title: '结果',
      dataIndex: 'result'
    }
  ]

  return (
    <div className={styles.box}>
      <div>
        <Space>
          <Button onClick={() => {
            navigator.mediaDevices.getUserMedia({
              audio: false, // 不需要音频
              video: {
                width: 500,
                height: 500
              }
            }).then(stream => { // stream是视频流
              const video = document.querySelector('video')
              if (video) {
                video.srcObject = stream
              }
              video?.play()

              // const video = document.querySelector('video') as any
              // if (video) {
              //   video.srcObject = stream
              //   video.play()
              // }
            }).catch(err => {
              console.log('出错了', err)
            })
          }} type="primary" icon={<CameraOutlined/>}>
            打开摄像头
          </Button>
          <Button onClick={() => {
            const video = document.querySelector('video')
            const canvas = document.querySelector('canvas')
            // 显示视频中的图片
            canvas?.getContext('2d')?.drawImage(video as any, 0, 0, 500, 500)
            // 将图片转成base64字符串
            const base64 = canvas?.toDataURL()
            // 将图片图片数据发送给服务器
            axios
              .post('http://127.0.0.1:5000/test', {
                image: base64
              }, {
                headers: {
                  Token: localStorage.getItem('token') + ''
                }
              })
              .then(res => {
                if (res.data.code === 4002) {
                  message.error(res.data.msg)
                  history.push('/login')
                } else {
                  setData(res.data.msg || JSON.stringify(res.data.data))

                  if (res.data.code === 0) { // 识别成功
                    // 刷新表格数据
                    loadRows()
                  }
                }
              })
              .catch(err => {
                console.log(err)
              })
          }} icon={<ScanOutlined/>}>
            截图
          </Button>
          <Button danger icon={<LogoutOutlined/>} onClick={() => {
            Modal.confirm({
              title: '提醒',
              content: '是否要退出登录？',
              okText: '是',
              cancelText: '否',
              onOk: () => {
                // 弹框提示正在退出登录中...
                const hide = message.loading('正在退出登录中....', 0)

                // 发送请求给服务器：告知我们要退出登录
                axios
                  .post('http://127.0.0.1:5000/logout', null, {
                    headers: {
                      'Token': localStorage.getItem('token') + ''
                    }
                  })
                  .then(() => {
                    // 隐藏弹框
                    hide()

                    // 清除token
                    localStorage.removeItem('token')

                    // 打开登录界面
                    history.push('/login')
                  })
                  .catch(() => {
                    // 隐藏弹框
                    hide()

                    // 提示
                    message.error('退出登录失败')
                  })
              }
            })
          }}>
            退出登录
          </Button>
        </Space>
      </div>
      <div className={styles.content}>
        <video className={styles.video} src=""></video>
        <canvas width="500" height="500"></canvas>
        <div style={{
          color: 'red',
          fontSize: 20
        }}>{data}</div>
      </div>
      <div>
        <Table
          rowKey={'id'}
          dataSource={rows}
          columns={columns}
          // pagination={{
          //   total: 100
          // }}
        />
      </div>
    </div>
  )
}