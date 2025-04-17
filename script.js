const { createClient } = supabase;
const supabaseClient = createClient(
  'https://ffpeqxwbrfenvrnjbdku.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcGVxeHdicmZlbnZybmpiZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTI3MDUsImV4cCI6MjA2MDI4ODcwNX0.-Mug66vudsTk-FwX2QNtNC2RhFHPoc1T7qf7NN34_mc'
);

let sortAsc = true;

async function loadData() {
  const { data, error } = await supabaseClient.from('items').select('*');
  if (error) return alert('加载失败：' + error.message);

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  data.forEach(item => addRow(item));
}

function addRow(item = {}) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="checkbox" class="row-check"></td>
    <td><input class="name" value="${item.name || ''}"></td>
    <td>
      <select class="status">
        <option value="国内现货"${item.status === '国内现货' ? ' selected' : ''}>国内现货</option>
        <option value="日本在库"${item.status === '日本在库' ? ' selected' : ''}>日本在库</option>
        <option value="正在发送"${item.status === '正在发送' ? ' selected' : ''}>正在发送</option>
      </select>
    </td>
    <td><input type="number" class="total" value="${item.total || 0}"></td>
    <td><input type="number" class="price" value="${item.price || 0}"></td>
    <td><input type="number" class="cost" value="${item.cost || 0}"></td>
    <td><input type="number" class="sold" value="${item.sold || 0}"></td>
    <td><input type="number" class="sell" value="${item.sell || 0}"></td>
    <td class="remaining">0</td>
    <td class="income">0.00</td>
    <td>
      <button onclick="saveRow(this, ${item.id || 'null'})">💾 保存</button>
      <button onclick="deleteRow(${item.id})">🗑️ 删除</button>
    </td>
  `;

  document.getElementById('table-body').appendChild(row);
  updateRow(row);
  row.querySelectorAll('input, select').forEach(input =>
    input.addEventListener('input', () => updateRow(row))
  );
}

function updateRow(row) {
  const total = parseInt(row.querySelector('.total').value) || 0;
  const sold = parseInt(row.querySelector('.sold').value) || 0;
  const sell = parseFloat(row.querySelector('.sell').value) || 0;
  const remaining = total - sold;
  const income = sold * sell;
  row.querySelector('.remaining').innerText = remaining;
  row.querySelector('.income').innerText = income.toFixed(2);
}

async function saveRow(button, id) {
  const row = button.closest('tr');
  const item = {
    name: row.querySelector('.name').value,
    status: row.querySelector('.status').value,
    total: parseInt(row.querySelector('.total').value),
    price: parseFloat(row.querySelector('.price').value),
    cost: parseFloat(row.querySelector('.cost').value),
    sold: parseInt(row.querySelector('.sold').value),
    sell: parseFloat(row.querySelector('.sell').value)
  };

  let result;
  if (id) {
    result = await supabaseClient.from('items').update(item).eq('id', id);
  } else {
    result = await supabaseClient.from('items').insert([item]).select();
  }

  if (result.error) {
    alert('保存失败：' + result.error.message);
  } else {
    alert('✅ 保存成功');
    loadData();
  }
}

async function deleteRow(id) {
  if (!confirm('确定要删除这项吗？')) return;
  const { error } = await supabaseClient.from('items').delete().eq('id', id);
  if (error) {
    alert('删除失败：' + error.message);
  } else {
    alert('✅ 已删除');
    loadData();
  }
}

// 批量应用状态
function applyBulkStatus() {
  const selected = document.querySelectorAll('.row-check:checked');
  const newStatus = document.getElementById('bulk-status').value;
  if (!newStatus) return alert('请选择要应用的状态');
  selected.forEach(checkbox => {
    const row = checkbox.closest('tr');
    row.querySelector('.status').value = newStatus;
  });
}

// 全选/取消全选
function toggleSelectAll(master) {
  const checks = document.querySelectorAll('.row-check');
  checks.forEach(c => (c.checked = master.checked));
}

// 物品名排序
function sortByName() {
  const rows = Array.from(document.querySelectorAll('#table-body tr'));
  rows.sort((a, b) => {
    const nameA = a.querySelector('.name').value.trim();
    const nameB = b.querySelector('.name').value.trim();
    return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  sortAsc = !sortAsc;

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  rows.forEach(row => tbody.appendChild(row));
}

window.onload = loadData;
