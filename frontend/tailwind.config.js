/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 启用 class 模式切换暗黑主题
  theme: {
    extend: {
      // Apple风格颜色系统
      colors: {
        apple: {
          blue: '#007AFF',
          'blue-dark': '#0056CC',
          'blue-light': '#40A2FF',
          gray: {
            50: '#F9F9F9',
            100: '#F2F2F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#636366',
            800: '#48484A',
            900: '#1C1C1E'
          },
          red: '#FF3B30',
          green: '#34C759',
          orange: '#FF9500',
          yellow: '#FFCC00',
          purple: '#AF52DE',
          pink: '#FF2D92',
          indigo: '#5856D6',
          teal: '#5AC8FA'
        },
        background: {
          DEFAULT: 'rgb(255 255 255)',
          dark: 'rgb(28 28 30)'
        },
        foreground: {
          DEFAULT: 'rgb(28 28 30)',
          dark: 'rgb(242 242 247)'
        },
        border: {
          DEFAULT: 'rgb(229 229 234)',
          dark: 'rgb(99 99 102)'
        }
      },
      // Apple风格圆角
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px'
      },
      // Apple风格阴影
      boxShadow: {
        'apple': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 10px 25px 0 rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 20px 40px 0 rgba(0, 0, 0, 0.15)',
        'apple-inner': 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'apple-focus': '0 0 0 3px rgba(0, 122, 255, 0.3)'
      },
      // Apple风格字体大小
      fontSize: {
        'apple-xs': '11px',
        'apple-sm': '13px',
        'apple-base': '15px',
        'apple-lg': '17px',
        'apple-xl': '21px',
        'apple-2xl': '27px',
        'apple-3xl': '33px'
      },
      // Apple风格间距
      spacing: {
        'apple-xs': '4px',
        'apple-sm': '8px',
        'apple-md': '16px',
        'apple-lg': '24px',
        'apple-xl': '32px',
        'apple-2xl': '48px'
      },
      // Apple风格字重
      fontWeight: {
        'apple-regular': '400',
        'apple-medium': '500',
        'apple-semibold': '600',
        'apple-bold': '700'
      },
      // Apple风格动画
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'apple-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      // Apple风格模糊效果
      backdropBlur: {
        'apple': '20px',
        'apple-lg': '40px'
      },
      // 认证页面专用配置
      backgroundImage: {
        'auth-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'auth-gradient-light': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      },
      // 认证表单专用配置
      maxWidth: {
        'auth': '400px',
        'auth-lg': '480px'
      },
      // 输入框专用配置
      height: {
        'input': '48px',
        'input-lg': '56px'
      }
    },
  },
  plugins: [],
}