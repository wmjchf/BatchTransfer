# Contributing to NTYE

感谢您对NTYE项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、测试还是反馈。

## 🤝 如何贡献

### 报告Bug

如果您发现了bug，请通过以下方式报告：

1. 在GitHub Issues中搜索是否已有相关报告
2. 如果没有，请创建新的Issue
3. 使用bug报告模板，包含以下信息：
   - 详细的bug描述
   - 重现步骤
   - 预期行为
   - 实际行为
   - 环境信息（浏览器、操作系统等）
   - 截图或录屏（如果适用）

### 功能请求

如果您有新功能的想法，请：

1. 在GitHub Issues中搜索是否已有相关请求
2. 如果没有，请创建新的Issue
3. 使用功能请求模板，详细描述：
   - 功能需求
   - 使用场景
   - 预期效果
   - 可能的实现方案

### 代码贡献

#### 开发环境设置

1. Fork本仓库
2. 克隆您的fork到本地：
   ```bash
   git clone https://github.com/your-username/ntyeReact.git
   cd ntyeReact
   ```

3. 安装依赖：
   ```bash
   pnpm install
   ```

4. 创建并切换到新分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. 启动开发服务器：
   ```bash
   pnpm dev
   ```

#### 开发规范

##### 代码风格

- 使用TypeScript编写所有代码
- 遵循ESLint规则
- 使用Prettier格式化代码
- 组件使用PascalCase命名
- 文件使用kebab-case命名
- 函数使用camelCase命名

##### 提交规范

使用[Conventional Commits](https://www.conventionalcommits.org/)格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型包括：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: add wallet connection component"
git commit -m "fix: resolve minting transaction error"
git commit -m "docs: update installation guide"
```

##### 组件开发

1. 在`src/components/`目录下创建新组件
2. 使用TypeScript接口定义props
3. 添加适当的JSDoc注释
4. 确保组件是响应式的
5. 添加必要的测试

示例组件结构：
```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

/**
 * Component description
 * @param props - Component props
 * @returns JSX element
 */
export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <div className="component">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
};
```

##### 国际化

所有用户可见的文本都应该支持国际化：

1. 在`messages/en.json`和`messages/zh.json`中添加翻译
2. 使用`useTranslations` hook获取翻译
3. 确保翻译的准确性和一致性

```typescript
import { useTranslations } from 'next-intl';

export const Component = () => {
  const t = useTranslations('Component');
  
  return <h1>{t('title')}</h1>;
};
```

#### 测试

- 为新功能编写单元测试
- 确保所有测试通过
- 保持测试覆盖率

#### 提交Pull Request

1. 确保代码符合项目规范
2. 运行测试确保通过
3. 提交代码：
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

4. 在GitHub上创建Pull Request
5. 使用PR模板，包含：
   - 功能描述
   - 相关Issue链接
   - 测试说明
   - 截图（如果适用）

### 文档贡献

我们欢迎文档改进：

- 修复拼写错误
- 改进文档结构
- 添加示例代码
- 翻译文档
- 更新安装指南

### 设计贡献

如果您是设计师，我们欢迎：

- UI/UX改进建议
- 设计稿和原型
- 图标和插图
- 品牌指南

## 📋 开发检查清单

在提交PR之前，请确保：

- [ ] 代码符合TypeScript规范
- [ ] 通过了所有ESLint检查
- [ ] 代码已格式化
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 支持国际化
- [ ] 响应式设计正常
- [ ] 在多个浏览器中测试过

## 🏷️ 标签说明

我们使用以下标签来组织Issues和PRs：

- `bug`: Bug报告
- `enhancement`: 功能增强
- `documentation`: 文档相关
- `good first issue`: 适合新手的Issue
- `help wanted`: 需要帮助的Issue
- `question`: 问题讨论
- `wontfix`: 不会修复的Issue

## 🎯 新手友好

如果您是新手，可以：

1. 查看标记为`good first issue`的Issues
2. 从文档改进开始
3. 报告bug或提出建议
4. 参与社区讨论

## 📞 获取帮助

如果您需要帮助：

- 查看[README.md](./README.md)
- 搜索现有的Issues和PRs
- 在Discussions中提问
- 联系项目维护者

## 🙏 致谢

感谢所有为NTYE项目做出贡献的开发者！

---

**记住：每一个贡献，无论大小，都是宝贵的！** 