"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Spin, message } from "antd";
import { UserOutlined, FileTextOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { adminApi, isAdmin, type AdminStats } from "@/lib/api";

const categoryNames: Record<string, string> = {
  lost_found: "失物招领",
  market: "二手交易",
  info: "信息发布",
};

const statusNames: Record<string, string> = {
  active: "活跃",
  resolved: "已解决",
  closed: "已关闭",
};

const statusColors: Record<string, string> = {
  active: "green",
  resolved: "blue",
  closed: "default",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      message.error("需要管理员权限");
      router.push("/login");
      return;
    }
    adminApi
      .getStats()
      .then((data) => setStats(data))
      .catch(() => message.error("加载统计数据失败"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        管理员后台
      </h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: 16 }}
            onClick={() => router.push("/admin/users")}
          >
            <Statistic
              title="注册用户"
              value={stats.total_users}
              prefix={<UserOutlined style={{ color: "#4f46e5" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: 16 }}
            onClick={() => router.push("/admin/posts")}
          >
            <Statistic
              title="总帖子数"
              value={stats.total_posts}
              prefix={<FileTextOutlined style={{ color: "#f59e0b" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic
              title="活跃帖子"
              value={stats.active_posts}
              prefix={<CheckCircleOutlined style={{ color: "#10b981" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card title="按分类统计" style={{ borderRadius: 16 }}>
            {Object.entries(stats.by_category).map(([cat, count]) => (
              <div
                key={cat}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>{categoryNames[cat] || cat}</span>
                <Tag color="blue">{count}</Tag>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="按状态统计" style={{ borderRadius: 16 }}>
            {Object.entries(stats.by_status).map(([st, count]) => (
              <div
                key={st}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>{statusNames[st] || st}</span>
                <Tag color={statusColors[st]}>{count}</Tag>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="最近注册用户" style={{ borderRadius: 16 }}>
            {stats.recent_users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>
                  {u.username}
                  {u.is_admin && <Tag color="red" style={{ marginLeft: 8 }}>管理员</Tag>}
                </span>
                <span style={{ color: "#999", fontSize: 12 }}>
                  {u.created_at?.slice(0, 10)}
                </span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
