import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import json

# Đọc dữ liệu từ file CSV
data = pd.read_csv("kf_coffee (1) - Sao chép - Trang tính1.csv")

# Chuẩn hóa tên cột
data.columns = data.columns.str.strip().str.lower()

# Hàm để tính tổng stock_decreased cho từng sản phẩm
def total_stock_decreased(history_str):
    try:
        history = json.loads(history_str).get("stock_history", [])
        return sum(float(entry.get("stock_decreased", 0)) for entry in history)
    except:
        return 0

# Hàm tính tổng số lượng bán từ stock_history
def total_sold_from_history(stock_history_str):
    try:
        history = json.loads(stock_history_str).get("stock_history", [])
        return sum(float(entry.get("stock_decreased", 0)) for entry in history)
    except:
        return 0

# Áp dụng hàm để tính số lượng bán
data["stock_decreased"] = data["stock_history"].apply(total_stock_decreased)
data['so_luong_ban'] = data['stock_history'].apply(total_sold_from_history)

# Tính doanh thu
data['doanh_thu'] = data['so_luong_ban'] * data['price']

# Nhóm và vẽ biểu đồ
top_products = data.groupby('name')['stock_decreased'].sum().sort_values(ascending=False).head(10)
revenue_by_product = data.groupby('name')['doanh_thu'].sum().sort_values(ascending=False).head(5)

# Vẽ cả hai biểu đồ trong một cửa sổ
fig, ax = plt.subplots(1, 2, figsize=(18, 7))

# Biểu đồ top sản phẩm bán chạy nhất
sns.barplot(x=top_products.values, y=top_products.index, palette='viridis', ax=ax[0])
for i, v in enumerate(top_products.values):
    ax[0].text(v + 5, i, str(int(v)), color='black', va='center', fontweight='bold')
ax[0].set_title("Top 10 sản phẩm bán chạy nhất")
ax[0].set_xlabel("Số lượng bán")
ax[0].set_ylabel("Sản phẩm")

# Biểu đồ doanh thu top 5 sản phẩm
sns.barplot(x=revenue_by_product.values, y=revenue_by_product.index, palette='pastel', ax=ax[1])
for i, v in enumerate(revenue_by_product.values):
    ax[1].text(v * 0.98, i, f"{int(v):,} VNĐ", color='black', va='center', ha='right', fontweight='bold')
ax[1].set_title("Tỷ lệ doanh thu Top 5 sản phẩm")
ax[1].set_xlabel("Doanh thu (VNĐ)")
ax[1].set_ylabel("Sản phẩm")

plt.tight_layout()
plt.show()
