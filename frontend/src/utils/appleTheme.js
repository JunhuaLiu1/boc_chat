/**
 * Apple风格样式工具类和常量
 */

// Apple风格颜色主题
export const appleColors = {
  // 主色调
  primary: {
    blue: '#007AFF',
    blueDark: '#0056CC',
    blueLight: '#40A2FF'
  },
  
  // 中性色
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
  
  // 系统色
  semantic: {
    red: '#FF3B30',
    green: '#34C759',
    orange: '#FF9500',
    yellow: '#FFCC00',
    purple: '#AF52DE',
    pink: '#FF2D92',
    indigo: '#5856D6',
    teal: '#5AC8FA'
  }
};

// Apple风格组件样式类
export const appleStyles = {
  // 按钮样式
  button: {
    primary: 'bg-apple-blue hover:bg-apple-blue-dark focus:bg-apple-blue-dark active:bg-apple-blue-dark text-white font-apple-medium rounded-apple transition-all duration-200 apple focus:shadow-apple-focus',
    secondary: 'bg-apple-gray-200 hover:bg-apple-gray-300 dark:bg-apple-gray-700 dark:hover:bg-apple-gray-600 text-apple-gray-900 dark:text-apple-gray-100 font-apple-medium rounded-apple transition-all duration-200 apple',
    ghost: 'bg-transparent hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-apple-blue font-apple-medium rounded-apple transition-all duration-200 apple',
    link: 'text-apple-blue hover:text-apple-blue-dark font-apple-medium transition-colors duration-200'
  },
  
  // 输入框样式
  input: {
    base: 'w-full h-input px-4 py-3 bg-apple-gray-50 dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-apple text-apple-gray-900 dark:text-apple-gray-100 placeholder-apple-gray-500 focus:outline-none focus:border-apple-blue focus:shadow-apple-focus transition-all duration-200 apple',
    error: 'border-apple-red focus:border-apple-red focus:shadow-apple-focus-error',
    success: 'border-apple-green focus:border-apple-green'
  },
  
  // 卡片样式
  card: {
    base: 'bg-white dark:bg-apple-gray-800 rounded-apple-lg shadow-apple border border-apple-gray-200 dark:border-apple-gray-700 transition-all duration-200',
    interactive: 'hover:shadow-apple-md transform hover:-translate-y-0.5 transition-all duration-200 apple',
    glass: 'bg-white/80 dark:bg-apple-gray-800/80 backdrop-blur-apple rounded-apple-lg border border-apple-gray-200/50 dark:border-apple-gray-700/50'
  },
  
  // 文本样式
  text: {
    heading: 'text-apple-gray-900 dark:text-apple-gray-100 font-apple-bold',
    body: 'text-apple-gray-700 dark:text-apple-gray-300 font-apple-regular',
    caption: 'text-apple-gray-500 dark:text-apple-gray-500 font-apple-regular text-apple-sm',
    error: 'text-apple-red font-apple-medium text-apple-sm',
    success: 'text-apple-green font-apple-medium text-apple-sm'
  },
  
  // 布局样式
  layout: {
    container: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    authContainer: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-apple-gray-50 to-apple-gray-100 dark:from-apple-gray-900 dark:to-apple-gray-800',
    authCard: 'w-full max-w-auth mx-4 p-8 bg-white/80 dark:bg-apple-gray-800/80 backdrop-blur-apple rounded-apple-xl shadow-apple-lg border border-apple-gray-200/50 dark:border-apple-gray-700/50'
  },
  
  // 表单样式
  form: {
    group: 'space-y-1',
    label: 'block text-apple-sm font-apple-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1',
    fieldset: 'space-y-apple-md',
    actions: 'flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3'
  },
  
  // 状态样式
  state: {
    loading: 'opacity-50 pointer-events-none',
    disabled: 'opacity-40 cursor-not-allowed',
    active: 'bg-apple-blue/10 border-apple-blue text-apple-blue',
    focus: 'ring-2 ring-apple-blue/30 border-apple-blue'
  }
};

// Apple风格动画配置
export const appleAnimations = {
  // 基础过渡
  transition: {
    fast: 'transition-all duration-150 ease-apple',
    normal: 'transition-all duration-200 ease-apple',
    slow: 'transition-all duration-300 ease-apple'
  },
  
  // 弹性动画
  spring: {
    subtle: 'transition-all duration-200 ease-apple-spring',
    normal: 'transition-all duration-300 ease-apple-spring',
    strong: 'transition-all duration-500 ease-apple-spring'
  },
  
  // 悬停效果
  hover: {
    lift: 'hover:-translate-y-0.5 hover:shadow-apple-md',
    scale: 'hover:scale-105',
    glow: 'hover:shadow-apple-lg hover:shadow-apple-blue/20'
  }
};

// 响应式断点
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// 工具函数：组合样式类
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// 工具函数：根据条件组合样式
export const clsx = (obj) => {
  return Object.entries(obj)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
};

// Apple风格主题配置
export const appleTheme = {
  colors: appleColors,
  styles: appleStyles,
  animations: appleAnimations,
  breakpoints
};

export default appleTheme;