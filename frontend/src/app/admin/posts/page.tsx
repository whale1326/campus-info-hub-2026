"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card, Table, Button, Input, Tag, Popconfirm, Select, Space, Typography, message,
} from "antd";
import { DeleteOutlined, SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, isAdmin, type Post } from "@/lib/api";

const { Title } = Typography;

const categoryNames: Record<string, string> = {
  lost_found: "失物招领",
  market: "二手交易",
  info: "信息发布",
};

const categoryColors: Record<string, string> = {
  lost_found: "orange",
  market: "green",
  info: "blue",
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

export default function AdminPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchData = useCallback(
    (p = page, kw = keyword, st = statusFilter, cat = categoryFilter) => {
      if (!isAdmin()) {
        router.push("/login");
        return;
      }
      setLoading(true);
      adminApi
        .listPosts({ page: p, keyword: kw, status: st, category: cat })
        .then((data) => {
          setPosts(data.posts);
          setTotal(data.total);
        })
        .catch(() => message.error("加载帖子列表失败"))
        .finally(() => setLoading(false));
    },
    [page, keyword, statusFilter, categoryFilter, router]
  );

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleDelete = (id: number) => {
    adminApi
      .deletePost(id)
      .then(() => {
        message.success("帖子已删除");
        fetchData(page, keyword, statusFilter, categoryFilter);
      })
      .catch((e) => message.error(e.message || "删除失败"));
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    adminApi
      .updatePostStatus(id, newStatus)
      .then(() => {
        message.success("状态已更新");
        fetchData(page, keyword, statusFilter, categoryFilter);
      })
      .catch((e) => message.error(e.message || "更新失败"));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Post) => (
        <Link href={`/${record.category === "info" ? "post" : record.category}/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (cat: string) => <Tag color={categoryColors[cat]}>{categoryNames[cat]}</Tag>,
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      width: 90,
      render: (price: number) =>
        price > 0 ? (
          <span style={{ color: "#f59e0b", fontWeight: 600 }}>¥{price}</span>
        ) : (
          <span style={{ color: "#ccc" }}>-</span>
        ),
    },
    {
      title: "作者",
      dataIndex: "author_name",
      key: "author_name",
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (st: string, record: Post) => (
        <Select
          size="small"
          value={st}
          style={{ width: 110 }}
          onChange={(val) => handleStatusChange(record.id, val)}
          options={Object.entries(statusNames).map(([val, label]) => ({
            value: val,
            label: (
              <Tag color={statusColors[val]} style={{ margin: 0 }}>
                {label}
              </Tag>
            ),
          }))}
        />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (text: string) => text?.slice(0, 16),
    },
    {
      title: "操作",
      key: "action",
      width: 90,
      render: (_: unknown, record: Post) => (
        <Popconfirm
          title="确认删除该帖子？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin")}>
          返回后台
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          内容管理
        </Title>
      </Space>

      <Card style={{ borderRadius: 16 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索标题或内容"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchData(1, keyword, statusFilter, categoryFilter);
            }}
            style={{ width: 220 }}
          />
          <Select
            placeholder="按分类筛选"
            allowClear
            style={{ width: 130 }}
            value={categoryFilter || undefined}
            onChange={(val) => {
              setCategoryFilter(val || "");
              setPage(1);
              fetchData(1, keyword, statusFilter, val || "");
            }}
            options={Object.entries(categoryNames).map(([val, label]) => ({ value: val, label }))}
          />
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 130 }}
            value={statusFilter || undefined}
            onChange={(val) => {
              setStatusFilter(val || "");
              setPage(1);
              fetchData(1, keyword, val || "", categoryFilter);
            }}
            options={Object.entries(statusNames).map(([val, label]) => ({ value: val, label }))}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              fetchData(1, keyword, statusFilter, categoryFilter);
            }}
          >
            搜索
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: (p) => {
              setPage(p);
              fetchData(p, keyword, statusFilter, categoryFilter);
            },
          }}
        />
      </Card>
    </div>
  );
}
