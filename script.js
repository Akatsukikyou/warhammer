// 初始化 Supabase 客户端
const SUPABASE_URL = 'https://ffpeqxwbrfenvrnjbdku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcGVxeHdicmZlbnZybmpiZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTI3MDUsImV4cCI6MjA2MDI4ODcwNX0.-Mug66vudsTk-FwX2QNtNC2RhFHPoc1T7qf7NN34_mc'; // 为保护起见省略，建议正式部署前使用.env管理
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


// 加载数据
async function loadData() {
  const { data, error } = await supabaseClient.from('items').select('*');
  if (error) {
    alert('❌ 加载失败: ' + error.message);
    return;
  }

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  data.forEach(item => addRow(item));
}

// 添加一行
function addRow(item = {}) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input class="name" value="${item.name || ''}"></td>
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

  row.querySelectorAll('input').forEach(input =>
    input.addEventListener('input', () => updateRow(row))
  );
}

// 实时计算剩余与收入
function updateRow(row) {
  const total = parseInt(row.querySelector('.total').value) || 0;
  const sold = parseInt(row.querySelector('.sold').value) || 0;
  const sell = parseFloat(row.querySelector('.sell').value) || 0;
  const remaining = total - sold;
  const income = sold * sell;
  row.querySelector('.remaining').innerText = remaining;
  row.querySelector('.income').innerText = income.toFixed(2);
}

// 保存一行（新增或更新）
async function saveRow(button, id) {
  const row = button.closest('tr');
  const item = {
    name: row.querySelector('.name').value,
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
    result = await supabaseClient.from('items').insert([item]).select(); // 👈 加了 select() 才能拿到 id
  }


  if (result.error) {
    console.error('save fail：', result.error);
    alert('save fail：' + result.error.message);
  } else {
    console.log('success：', result.data); // 👈 加这个！
    alert('success');
    loadData();
  }
  
}


// 删除记录
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

// 初始化加载
window.onload = loadData;
