---
title: 变分自编码器的数学原理
date: 2026-02-09 13:00:00
tags:
  - 笔记
  - 深度学习
categories:
  - 技术分享
index_img: img/DDABAA55C1994888D8CA7985EF8E6F32.jpg 
excerpt: 变分自编码器（VAE）是大部分视觉 tokenizer 的基础。通过将高维像素空间映射到低维潜空间，VAE 实现了信息压缩和特征提取，便于模型后续的处理。
---
## 1. 架构介绍
变分自编码器（Variational Autoencoder, **VAE**）是含有隐变量（latent variable）的概率模型，由编码器和解码器组成，编码器和解码器都是神经网络。设输入样本为$d$维向量 $\bm{x}$，隐变量为$k$维向量 $\bm z$。编码器表示条件概率分布 $q_{\bm\phi}(\bm{z|x})$，它把高维的数据压缩为低维的特征；解码器表示条件概率分布 $p_{\bm\theta}(\bm{x|z})$，它把特征还原为数据。在具体实现上，默认假设它们都是**多元正态分布**(最大熵原理，实际上也可以是其他的分布)，这样编码器和解码器只需输出均值向量和协方差矩阵。
- 编码器表示概率分布 $\mathcal N(\bm\mu_e,\bm\Sigma_e)$，编码器输出均值向量 $\bm\mu_e$和 协方差矩阵 $\bm\Sigma_e=\text{diag}\{\sigma_{e1}^2,\sigma_{e2}^2,\dots,\sigma_{ek}^2\}$。
- 解码器表示概率分布 $\mathcal N(\bm\mu_d,\sigma_d\bm I)$，解码器只输出均值向量 $\bm\mu_d=\bm {\hat x}=f_{\bm\theta}(\bm z)$（$\sigma_d$常常作为超参数）。在推理阶段，模型输出 $\bm{\hat x}$ 即为均值 $\bm\mu_d$。

这些都是人为设置的归纳偏置。对于解码器，我们假设只要给定了隐变量（抓住了核心特征），剩下的像素之间的噪声就是互不干扰的白噪声；对于编码器，我们希望隐变量的各个维度是解耦的，使得两个协方差矩阵都是对角的，也让在计算正态分布时求逆和行列式简单得多。重构时假设噪声是均匀的，因此解码器的协方差矩阵对角线上元素都相同。

## 2.概率模型
由贝叶斯公式，
$$
 \displaystyle p_{\bm\theta}(\bm{z|x})=\frac{p_{\bm\theta}(\bm z)p_{\bm\theta}(\bm{x|z})}{p_{\bm\theta}(\bm x)}=\frac{p_{\bm\theta}(\bm z)p_{\bm\theta}(\bm{x|z})}{\displaystyle\int p_{\bm\theta}(\bm z)p_{\bm\theta}(\bm {x|z}) \mathrm d\bm z}
$$

其中，$p_{\bm\theta}(\bm{z|x})$ 称为**后验概率分布**，$p_{\bm\theta}(\bm z)$ 称为**先验概率分布**，$p_{\bm\theta}(\bm{x|z})$ 称为**似然函数**，$p_{\bm\theta}(\bm x)$ 称为**证据**。解码器的分布就是似然函数 $p_{\bm\theta}(\bm{x|z})$。对于后验概率分布，往往难以求解，因此我们用另一个较好求解的分布（变分分布）代替后验概率分布，并最小化它们之间的差别（用 KL 散度描述）。编码器的分布 $q_{\bm\phi}(\bm{z|x})$ 就是这样的变分分布，用于近似后验概率分布 $p_{\bm\theta}(\bm{z|x})$。

将后验推断问题巧妙地转化为优化问题进行求解的这种方法称为**变分推断（Variational Inference）**。

## 3.学习策略
VAE 的学习目标是从训练集 $\mathcal{D}=\{\bm x\}$ 中学习似然函数 $p_{\bm\theta}(\bm{x|z})$ 的参数 $\bm\theta$，用于新数据 $\hat {\bm x}$ 的生成。在统计学中，我们常用极大似然估计来确定一个概率密度的参数。

对数似然函数为

$$
\displaystyle\sum_{\bm x\in\mathcal{D}}\log p_{\bm\theta}(\bm x)=\sum_{\bm x\in\mathcal{D}}\log \int p_{\bm\theta}(\bm z)p_{\bm\theta}(\bm {x|z})\mathrm d\bm z
$$

对于每个样本，

$$
\begin{aligned} 
\log p_{\bm\theta}(\bm x) &=\mathbb E_{q_{\bm\phi}(\bm{z|x})}[\log p_{\bm\theta}(\bm x)]\\
&= \mathbb E_{q_{\bm\phi}(\bm{z|x})}\left[\log\frac{p_{\bm\theta}(\bm{x,z})}{p_{\bm\theta}(\bm{z|x})}\right] \\
&=\mathbb E_[q_{\bm\phi}(\bm{z|x})]\left[\log\frac{p_{\bm\theta}(\bm{x,z})q_{\bm\phi}(\bm{z|x})}{q_{\bm\phi}(\bm{z|x})p_{\bm\theta}(\bm{z|x})}\right] \\
&=\mathbb E_{q_{\bm\phi}(\bm{z|x})}\left[\log\frac{p_{\bm\theta}(\bm{x,z})}{q_{\bm\phi}(\bm{z|x})}\right]+\mathbb E_{q_{\bm\phi}(\bm{z|x})}\left[\log\frac{q_{\bm\phi}(\bm{z|x})}{p_{\bm\theta}(\bm{z|x})}\right] \\
&=\text{ELBO}(\bm x)+\text{KL}(q_{\bm\phi}(\bm{z|x})||p_{\bm\theta}(\bm{z|x}))
\end{aligned}
$$

因为第二项 KL 散度 $\text{KL}(q_{\bm\phi}(\bm{z|x})||p_{\bm\theta}(\bm{z|x}))\ge 0$，所以 $\log p_{\bm\theta}(\bm x)\ge\text{ELBO}(\bm x)$，ELBO 就是**证据下界**（**E**vidence **L**ower **BO**und）。

因此，最大化似然函数就是最大化证据下界。从变分推断的角度来看，如果将证据视为常数，那么最小化变分分布和真实后验分布之间的差别（KL 散度）也等价于最大化证据下界。

在深度学习框架（如PyTorch）中，我们习惯做做最小化。因此，对证据下界取负号并进一步展开：

$$
\begin{aligned} 
\text{Loss}&=-\text{ELBO}(\bm x)\\
&=-\mathbb E_{q_{\bm\phi}(\bm{z|x})}[\log p_{\bm\theta}(\bm{x,z})-\log q_{\bm\phi}(\bm{z|x})] \\
&=-\mathbb E_{q_{\bm\phi}(\bm{z|x})}[\log p_{\bm\theta}(\bm{x|z})]+\mathbb E_{q_{\bm\phi}(\bm{z|x})}\left[\log \frac{q_{\bm\phi}(\bm{z|x})}{p_{\bm \theta}(\bm z)}\right]
\end{aligned}
$$

- 第一项是编码器的分布与解码器的分布的**交叉熵**，也被称为**重构损失（Reconstruction Loss）**。在多元正态分布假设下，这等价于均方误差（MSE）。推导如下：
在计算机中，我们使用蒙特卡洛采样来近似这个期望：

$$
-\mathbb E_{q_{\bm\phi}(\bm{z|x})}[\log p_{\bm\theta}(\bm{x|z})]\approx-\frac{1}{L}\sum_{l=1}^L \log p_{\bm\theta}(\bm{x|z^{(l)}})
$$

其中 $z^{(l)}$ 是从 $q_{\bm\phi}(\bm{z|x})$ 中采样出的第 $l$ 个样本。

$$
\begin{aligned}
-\log p_{\bm\theta}(\bm{x|z^{(l)}})&=-\log\left(\left(\frac{1}{\sqrt{2\pi}\sigma_d}\right)^k\exp\left(-\frac{||\bm x-\bm\mu_d||^2}{2\sigma_d^2}\right)\right)\\
&=-k\log(\sqrt{2\pi}\sigma_d)+\frac{1}{2\sigma_d^2}||\bm x - \bm{\hat{x}}||^2\\
&\propto ||\bm x - \bm{\hat{x}}||^2=\text{MSE}(\bm x,\bm{\hat x})
\end{aligned}
$$

在训练时，实际并不对隐变量直接进行采样，而是采用后述再参数化技巧。注：如果输入数据是二值化的（如 MNIST 黑白图），通常假设 $p_{\bm\theta}(\bm{x|z})$ 服从伯努利分布，此时重构损失就变成了二元交叉熵（Binary Cross Entropy），而不是 MSE。
- 第二项是 **KL 散度**  $\text{KL}(q_{\bm\phi}(\bm{z|x})||p_{\bm \theta}(\bm z))$。它的意义是什么呢？

一般假设先验分布 $p_{\bm\theta}(\bm z)$ 是多元标准正态分布$\mathcal{N}(\bm0,\bm I)$。这样在训练时，编码器的分布（变分分布）会尽可能接近先验分布，强迫隐变量$\bm z$所有的分量都挤在0附近，并且有一定的方差。（否则，为了使重构损失尽可能地小，模型将使均值变得离散，方差尽可能地小，退化为自编码器）这保证了隐空间的连续性和完备性，同时防止模型过度拟合训练数据，增加泛化能力。因此，可以把这一项理解为正则化。

## 4.学习算法
为了最大化证据下界，我们需要在反向传播时使用随机梯度下降（或其变种 AdamW 等）更新参数。

先验分布 $p_{\bm\theta}(\bm z)$ 是多元标准正态分布时，正则化项有解析解：

$$
\begin{aligned}
    \text{KL}(q_{\bm\phi}(\bm{z|x})||p_{\bm \theta}(\bm z))&=\mathbb E_{q_{\bm\phi}(\bm{z|x})}\left[\frac12\bm z^{T}\bm z-\frac12(\bm z-\bm \mu_e)^T\bm \Sigma_e^{-1}(\bm z-\bm\mu_e)-\frac12\log(|\bm\Sigma_e|)\right]\\
    &=\frac12\mathbb E_{q_{\bm\phi}(\bm{z|x})}[\bm z^{T}\bm z]-\frac12\mathbb E_{q_{\bm\phi}(\bm{z|x})}[(\bm z-\bm \mu_e)^T\bm\Sigma_e^{-1}(\bm z-\bm\mu_e)]-\frac12\log(|\bm\Sigma_e|)\\
    &=\frac12[\text{tr}(\bm\Sigma_e)+\bm\mu_e^{T}\bm\mu_e-k-\log(|\bm\Sigma_e|)]\\
    &=-\frac12\sum_{j=1}^k[1+\log(\sigma_{ej})^2-\mu_{ej}^2-\sigma_{ej}^2]
    \end{aligned}
$$

其中不含 $\bm z$，可以正常进行反向传播。但对于重构损失，如前文所述，问题就出现了。如果隐变量$\bm z$是通过采样来获得一个确定值的，那么这样的操作不是可导的，这意味着无法在$\bm z$上进行反向传播。为了解决这个问题，我们引入**再参数化技巧（Reparameterization Trick）**：

- 第一步，引入一个独立的噪音。它遵循多元标准正态分布：

$$\bm \epsilon\sim\mathcal N(\bm 0,\bm I)$$

- 第二步，通过公式构造$\bm z$。利用正态分布的性质，通过平移和缩放得到$\bm z$：

$$z_{j}=\mu_{ej}+\sigma_{ej}\epsilon_j$$

这样得到的$\bm z$满足$\bm z\sim\mathcal N(\bm\mu_e, \bm\Sigma_e)$，而且在计算图中是可导的，梯度可以继续传播下去，让编码器得以训练。