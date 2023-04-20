Ext.define("TestApp.view.login.LoginController", {
  extend: "Ext.app.ViewController",
  alias: "controller.login",

  onLoginClick: function () {
    var usernameValue = Ext.getCmp("username").getValue();
    var passwordValue = Ext.getCmp("password").getValue();

    if (usernameValue === "admin" && passwordValue == "adm123") {
      localStorage.setItem("Login", usernameValue);
      localStorage.setItem("Password", passwordValue);

      this.getView().lookupViewModel().set({
        Login: usernameValue,
        isLogged: true,
      });
    } else alert("Логин и/или пароль неверны.");
  },
});

Ext.define("TestApp.view.login.Login", {
  extend: "Ext.window.Window",
  xtype: "login",

  requires: ["TestApp.view.login.LoginController", "Ext.form.Panel"],

  controller: "login",
  bodyPadding: 10,
  title: "Окно входа",
  closable: false,
  autoShow: true,
  modal: true,
  resizable: false,
  draggable: false,

  items: {
    xtype: "form",
    reference: "form",
    items: [
      {
        xtype: "textfield",
        name: "username",
        fieldLabel: "Пользователь",
        id: "username",
        allowBlank: false,
      },
      {
        xtype: "textfield",
        name: "password",
        inputType: "password",
        fieldLabel: "Пароль",
        id: "password",
        allowBlank: false,
      },
      {
        xtype: "displayfield",
        hideEmptyLabel: false,
        value: "Введите Ваш пароль",
      },
    ],
    buttons: [
      {
        text: "Войти",
        formBind: true,
        listeners: {
          click: "onLoginClick",
        },
      },
    ],
  },
});

Ext.define("TestApp.view.main.MainModel", {
  extend: "Ext.app.ViewModel",

  alias: "viewmodel.main",

  data: {
    name: "TestApp",
    isLogged: !!localStorage.getItem("Login"),
    Login: localStorage.getItem("Login"),
  },
});

Ext.define("TestApp.view.main.MainController", {
  extend: "Ext.app.ViewController",

  alias: "controller.main",

  onLogoutButton: function () {
    localStorage.removeItem("Login");
    localStorage.removeItem("Password");

    this.getView().lookupViewModel().set({
      Login: null,
      isLogged: false,
    });
  },

  onDocumentsClick: function () {
    var grid = Ext.getCmp("myGrid");
    var dockFilter = Ext.getCmp("dockFilter");
    if (grid.isVisible()) {
      grid.hide();
      dockFilter.hide();
    } else {
      grid.show();
      dockFilter.show();
    }
  },

  onNameFilterChange: function (field, newValue) {
    var grid = this.lookupReference("myGrid");
    var store = grid.getStore();
    store.clearFilter();
    if (newValue) {
      store.filter({
        property: "docName",
        value: newValue,
        anyMatch: true,
        caseSensitive: false,
      });
    }
  },

  onNameFilterClick: function () {
    var field = this.lookupReference("nameFilter");
    var value = field.getValue();
    this.onNameFilterChange(field, value);
  },

  onSignedFilterChange: function (field, newValue) {
    var grid = this.lookupReference("myGrid");
    var store = grid.getStore();
    store.clearFilter();
    if (newValue) {
      store.filter("signed", true);
    }
  },

  onAddProduct: function () {
    var addWindow = Ext.create("Ext.window.Window", {
      title: "Добавление товара",
      width: 400,
      height: 200,

      items: [
        {
          xtype: "form",
          id: "addForm",
          items: [
            {
              xtype: "textfield",
              name: "id",
              fieldLabel: "ID",
            },
            {
              xtype: "textfield",
              name: "name",
              fieldLabel: "Название",
            },
            {
              xtype: "textareafield",
              name: "description",
              fieldLabel: "Описание",
            },
            {
              xtype: "checkboxfield",
              name: "signed",
              fieldLabel: "Подписано",
            },
          ],
        },
      ],

      buttons: [
        {
          text: "Добавить",
          handler: function () {
            var form = addWindow.down("form");
            var values = form.getValues();

            Ext.Ajax.request({
              url: "addProduct",
              method: "POST",
              params: values,
              success: function (response) {
                addWindow.close();
                Ext.Msg.alert("Успешно", "Товар успешно добавлен");
                Ext.getStore("Store").load();
              },
              failure: function (response) {
                Ext.Msg.alert(
                  "Ошибка",
                  "Не удалось добавить товар. Пожалуйста, попробуйте еще раз."
                );
              },
            });
          },
        },
      ],
    });

    addWindow.show();
  },
});

Ext.define("MyModel", {
  extend: "Ext.data.Model",
  fields: [
    { name: "id", type: "int" },
    { name: "docName", type: "string" },
    { name: "description", type: "string" },
    { name: "signed", type: "boolean" },
  ],
});

Ext.create("Ext.data.Store", {
  model: "MyModel",
  storeId: "Store",
  proxy: {
    type: "ajax",
    url: "data.json",
    reader: {
      type: "json",
      rootProperty: "data",
    },
  },
  autoLoad: true,
});

Ext.define("TestApp.view.main.Main", {
  extend: "Ext.container.Container",
  xtype: "app-main",

  requires: [
    "Ext.plugin.Viewport",
    "Ext.window.MessageBox",
    "TestApp.view.main.MainController",
  ],

  controller: "main",

  items: {
    xtype: "panel",
    minHeight: 1000,

    dockedItems: [
      {
        xtype: "toolbar",
        dock: "top",

        items: {
          xtype: "button",
          text: "Документы",
          listeners: {
            click: "onDocumentsClick",
          },
        },
      },
      {
        xtype: "toolbar",
        id: "dockFilter",
        dock: "top",
        hidden: true,
        items: [
          {
            xtype: "textfield",
            fieldLabel: "Наименование",
            width: 280,
            emptyText: "Введите название документа",
            listeners: {
              change: "onNameFilterChange",
            },
          },
          {
            xtype: "button",
            text: "Фильтр",
            margin: "0 20 0 0px",
            handler: "onNameFilterClick",
          },
          {
            xtype: "checkboxfield",
            fieldLabel: "Подписанные",
            labelWidth: 90,
            listeners: {
              change: "onSignedFilterChange",
            },
          },
          {
            xtype: "button",
            text: "Добавить товар",
            margin: "0  0 50 0px",
            listeners: {
              click: "onAddProduct",
            },
          },
        ],
      },

      {
        xtype: "toolbar",
        dock: "right",
        width: 200,
        border: true,
        items: [
          {
            xtype: "label",
            bind: {
              html: "Добрый день, {Login}",
            },
            margin: "20 30",
          },
          {
            xtype: "button",
            id: "myBtn",
            text: "Выйти",
            maxWidth: "100",
            margin: "0 40",
            listeners: {
              click: "onLogoutButton",
            },
          },
        ],
      },
    ],

    items: [
      {
        xtype: "grid",
        id: "myGrid",
        store: "Store",

        reference: "myGrid",

        hidden: true,
        columns: [
          { header: "ID", dataIndex: "id", editor: "textfield" },
          {
            header: "Название",
            dataIndex: "docName",
            flex: 1,
            xeditor: {
              xtype: "textareafield",
              allowBlank: false,
            },
          },
          { header: "Описание Документа", flex: 2, dataIndex: "description" },
          {
            header: "Подпись",
            dataIndex: "signed",
            flex: 1,
            renderer: function (value) {
              if (value) {
                return '<div style="background-color: green;">Да</div>';
              } else {
                return "<div>Нет</div>";
                // return '<div style="background-color: red;">Нет</div>';
              }
            },
          },
        ],
        listeners: {
          itemdblclick: function (grid, record) {
            var editWindow = Ext.create("Ext.window.Window", {
              title: "Документ № " + record.get("id"),
              width: 400,
              height: 200,

              items: [
                {
                  xtype: "form",
                  items: [
                    {
                      xtype: "textfield",
                      name: "name",
                      fieldLabel: "Документ",
                      value: record.get("docName"),
                    },
                    {
                      xtype: "checkboxfield",
                      name: "signed",
                      fieldLabel: "Подписано",
                      checked: record.get("signed"),
                    },
                  ],
                },
              ],

              buttons: [
                {
                  text: "Save",
                  handler: function () {
                    var form = editWindow.down("form");
                    var values = form.getValues();
                    record.set(values);
                    editWindow.close();
                  },
                },
              ],
            });

            editWindow.show();
          },
        },
      },
    ],
  },
});

Ext.application({
  name: "Fiddle",

  launch: function () {
    var login;
    var password;

    login = localStorage.getItem("Login");
    password = localStorage.getItem("Password");

    Ext.create({
      viewModel: {
        type: "main",
      },
      plugins: "viewport",
      xtype: "container",
      items: [
        {
          xtype: "app-main",
          hidden: true,
          bind: {
            hidden: "{!isLogged}",
          },
        },
        {
          xtype: "login",
          hidden: true,
          bind: {
            hidden: "{isLogged}",
          },
        },
      ],
    });
  },
});
