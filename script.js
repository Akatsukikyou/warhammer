// 初始化或加载本地存储
function loadData() {
  const data = JSON.parse(localStorage.getItem('inventoryData') || '[]');
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  data.forEach((item, index) => addRow(item, index));
}

// 保存到本地存储
function saveData() {
  const rows = document.querySelectorAll('#table-body tr');
  const data = Array.from(rows).map(row => ({
    name: row.querySelector('.name').value,
    total: row.querySelector('.total').value,
    price: row.querySelector('.price').value,
    cost: row.querySelector('.cost').value,
    sold: row.querySelector('.sold').value,
    sell: row.querySelector('.sell').value,
  }));
  localStorage.setItem('inventoryData', JSON.stringify(data));
}

// 添加一行
function addRow(data = {}, index = null) {
  const tbody = document.getElementById('table-body');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="text" class="name" value="${data.name || ''}"></td>
    <td><input type="number" class="total" value="${data.total || 0}"></td>
    <td><input type="number" class="price" value="${data.price || 0}"></td>
    <td><input type="number" class="cost" value="${data.cost || 0}"></td>
    <td><input type="number" class="sold" value="${data.sold || 0}"></td>
    <td><input type="number" class="sell" value="${data.sell || 0}"></td>
    <td class="remaining">0</td>
    <td class="income">0.00</td>
    <td><button onclick="deleteRow(this)">❌</button></td>
  `;

  tbody.appendChild(row);
  bindEvents(row);
  updateRow(row);
  saveData();
}

// 删除一行
function deleteRow(btn) {
  const row = btn.closest('tr');
  row.remove();
  saveData();
  updateAll();
}

// 绑定事件
function bindEvents(row) {
  const inputs = row.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      updateRow(row);
      saveData();
    });
  });
}

// 更新单行数据
function updateRow(row) {
  const total = parseInt(row.querySelector('.total').value) || 0;
  const sold = parseInt(row.querySelector('.sold').value) || 0;
  const sell = parseFloat(row.querySelector('.sell').value) || 0;
  const remaining = total - sold;
  const income = sold * sell;

  row.querySelector('.remaining').innerText = remaining;
  row.querySelector('.income').innerText = income.toFixed(2);
}

// 批量更新全部（用于加载后）
function updateAll() {
  const rows = document.querySelectorAll('#table-body tr');
  rows.forEach(row => updateRow(row));
}

// 导出 CSV
function exportCSV() {
  const rows = document.querySelectorAll('#table-body tr');
  let csv = '物品名,总数,单价,成本,卖出,售价,剩余,收入\n';

  rows.forEach(row => {
    const values = [
      row.querySelector('.name').value,
      row.querySelector('.total').value,
      row.querySelector('.price').value,
      row.querySelector('.cost').value,
      row.querySelector('.sold').value,
      row.querySelector('.sell').value,
      row.querySelector('.remaining').innerText,
      row.querySelector('.income').innerText,
    ];
    csv += values.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'inventory.csv';
  link.click();
}

// 初始加载
window.onload = () => {
  loadData();
  updateAll();
};
