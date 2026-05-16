\-- 1\. ROLES   
CREATE TABLE Roles (  
    RoleID INT PRIMARY KEY IDENTITY(1,1),  
    RoleName NVARCHAR(50) NOT NULL   
);

\-- 2\. USERS  
CREATE TABLE Users (  
    UserID INT PRIMARY KEY IDENTITY(1,1),  
    Username VARCHAR(50) UNIQUE NOT NULL,  
    Password VARCHAR(255) NOT NULL,  
    FullName NVARCHAR(100),  
    Email VARCHAR(100),  
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID)  
);

\-- 3\. CATEGORIES   
CREATE TABLE Categories (  
    CategoryID INT PRIMARY KEY IDENTITY(1,1),  
    CategoryName NVARCHAR(100),  
    Description NVARCHAR(255)  
);

\-- 4\. LOCATIONS   
CREATE TABLE Locations (  
    LocationID INT PRIMARY KEY IDENTITY(1,1),  
    LocationName NVARCHAR(100)  
);

\-- 5\. ASSETS  
CREATE TABLE Assets (  
    AssetID INT PRIMARY KEY IDENTITY(1,1),   
    AssetName NVARCHAR(100) NOT NULL,  
    SerialNumber VARCHAR(50) UNIQUE, \-- Số hiệu vật lý của NSX  
    QRCode VARCHAR(255) UNIQUE NOT NULL, \-- Định danh QR duy nhất để quét  
    Model NVARCHAR(100),  
    Configuration NVARCHAR(255),  
    Status VARCHAR(20) CHECK (Status IN ('Available', 'Assigned', 'Repairing', 'Disposed')),  
    PurchasePrice DECIMAL(18, 2),  
    WarrantyExpiry DATE,  
    CurrentDepreciationRate FLOAT DEFAULT 0, \-- Tỷ lệ khấu hao (%)  
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),  
    LocationID INT FOREIGN KEY REFERENCES Locations(LocationID)  
);

\-- 6\. SUPPLIERS  
CREATE TABLE Suppliers (  
    SupplierID INT PRIMARY KEY IDENTITY(1,1),  
    SupplierName NVARCHAR(200),  
    Contact VARCHAR(50),  
    Address NVARCHAR(255)  
);

\-- 7\. PURCHASE ORDERS   
CREATE TABLE PurchaseOrders (  
    OrderID INT PRIMARY KEY IDENTITY(1,1),  
    OrderDate DATETIME DEFAULT GETDATE(),  
    TotalAmount DECIMAL(18, 2),  
    Status NVARCHAR(50), \-- Đang chuẩn bị, Chờ giao hàng, Giao hàng thành công  
    SupplierID INT FOREIGN KEY REFERENCES Suppliers(SupplierID),  
    ApprovedBy INT FOREIGN KEY REFERENCES Users(UserID)  
);

\-- 8\. ORDER DETAILS   
CREATE TABLE OrderDetails (  
    OrderDetailID INT PRIMARY KEY IDENTITY(1,1),  
    OrderID INT FOREIGN KEY REFERENCES PurchaseOrders(OrderID),  
    AssetID INT NULL FOREIGN KEY REFERENCES Assets(AssetID),   
    DeviceName NVARCHAR(200),  
    Quantity INT,  
    UnitPrice DECIMAL(18, 2),  
    SubTotal AS (Quantity \* UnitPrice)  
);

\-- 9\. ASSIGNMENTS   
CREATE TABLE Assignments (  
    AssignmentID INT PRIMARY KEY IDENTITY(1,1),  
    StaffID INT FOREIGN KEY REFERENCES Users(UserID), \-- Người sử dụng  
    AdminID INT FOREIGN KEY REFERENCES Users(UserID), \-- Người thực hiện  
    AssignDate DATETIME DEFAULT GETDATE(),  
    Note NVARCHAR(255),  
    ApprovedBy INT FOREIGN KEY REFERENCES Users(UserID)  
);

\-- 10\. ASSIGNMENT DETAILS   
CREATE TABLE AssignmentDetails (  
    AssignDetailID INT PRIMARY KEY IDENTITY(1,1),  
    AssignmentID INT FOREIGN KEY REFERENCES Assignments(AssignmentID),  
    AssetID INT FOREIGN KEY REFERENCES Assets(AssetID)  
);

\-- 11\. RETURNS   
CREATE TABLE Returns (  
    ReturnID INT PRIMARY KEY IDENTITY(1,1),  
    AssignmentID INT FOREIGN KEY REFERENCES Assignments(AssignmentID),  
    StaffID INT FOREIGN KEY REFERENCES Users(UserID),  
    AdminID INT FOREIGN KEY REFERENCES Users(UserID),  
    ReturnDate DATETIME DEFAULT GETDATE(),  
    Reason NVARCHAR(255),  
    ApprovedBy INT FOREIGN KEY REFERENCES Users(UserID)  
);

\-- 12\. MAINTENANCE   
CREATE TABLE Maintenance (  
    MaintenanceID INT PRIMARY KEY IDENTITY(1,1),  
    TechnicianID INT FOREIGN KEY REFERENCES Users(UserID),  
    StartDate DATETIME,  
    EndDate DATETIME,  
    TotalCost DECIMAL(18, 2),  
    ApprovedBy INT FOREIGN KEY REFERENCES Users(UserID)  
);

\-- 13\. MAINTENANCE DETAILS  
CREATE TABLE MaintenanceDetails (  
    MaintDetailID INT PRIMARY KEY IDENTITY(1,1),  
    MaintenanceID INT FOREIGN KEY REFERENCES Maintenance(MaintenanceID),  
    AssetID INT FOREIGN KEY REFERENCES Assets(AssetID),  
    Issue NVARCHAR(255),  
    Action NVARCHAR(255),  
    Cost DECIMAL(18, 2\)  
);

\-- 14\. DISPOSALS   
CREATE TABLE Disposals (  
    DisposalID INT PRIMARY KEY IDENTITY(1,1),  
    AdminID INT FOREIGN KEY REFERENCES Users(UserID),  
    DisposalDate DATETIME DEFAULT GETDATE(),  
    TotalValue DECIMAL(18, 2),  
    Notes NVARCHAR(255),  
    ApprovedBy INT FOREIGN KEY REFERENCES Users(UserID)  
);

\-- 15\. DISPOSAL DETAILS   
CREATE TABLE DisposalDetails (  
    DisposalDetailID INT PRIMARY KEY IDENTITY(1,1),  
    DisposalID INT FOREIGN KEY REFERENCES Disposals(DisposalID),  
    AssetID INT FOREIGN KEY REFERENCES Assets(AssetID)  
);

\-- 16\. INVENTORY CHECKS   
CREATE TABLE InventoryChecks (  
    CheckID INT PRIMARY KEY IDENTITY(1,1),  
    StartDate DATETIME DEFAULT GETDATE(),  
    AdminID INT FOREIGN KEY REFERENCES Users(UserID),  
    ApprovedBy INT FOREIGN KEY REFERENCES Users(UserID)  
);

\-- 17\. INVENTORY DETAILS (Chi tiết kiểm kê)  
CREATE TABLE InventoryDetails (  
    InvDetailID INT PRIMARY KEY IDENTITY(1,1),  
    CheckID INT FOREIGN KEY REFERENCES InventoryChecks(CheckID),  
    AssetID INT FOREIGN KEY REFERENCES Assets(AssetID),  
    StatusInReality NVARCHAR(100),  
    Note NVARCHAR(255)  
);

GO

/\* \============================================================  
VIEW TỔNG HỢP: PHỤC VỤ QUÉT MÃ QR VÀ PHÂN QUYỀN  
\============================================================  
\*/

CREATE VIEW View\_AssetPortal\_Full AS  
SELECT   
    \-- Nhóm 1: Nhân viên thấy  
    a.AssetID,  
    a.QRCode,  
    a.AssetName,  
    a.Model,  
    a.Configuration,  
    a.Status AS AssetStatus,  
    c.CategoryName,  
    l.LocationName,  
    u\_staff.FullName AS CurrentUser,  
    a.WarrantyExpiry,

    \-- Nhóm 2: Kỹ thuật viên thấy (Thêm bảo trì & khấu hao)  
    (SEL ECT MAX(m.EndDate)   
     FROM Maintenance m   
     JOIN MaintenanceDetails md ON m.MaintenanceID \= md.MaintenanceID   
     WHERE md.AssetID \= a.AssetID) AS LastMaintenanceDate,  
       
    (SELECT TOP 1 Issue   
     FROM MaintenanceDetails   
     WHERE AssetID \= a.AssetID   
     ORDER BY MaintDetailID DESC) AS LastIssueNote,

    a.CurrentDepreciationRate,  
    CAST(a.PurchasePrice \* (1 \- a.CurrentDepreciationRate/100) AS DECIMAL(18,2)) AS RemainingValue,

    \-- Nhóm 3: Quản lý thấy (Thêm tài chính & nguồn gốc)  
    a.PurchasePrice,  
    s.SupplierName,  
    po.OrderDate AS PurchaseDate

FROM Assets a  
LEFT JOIN Categories c ON a.CategoryID \= c.CategoryID  
LEFT JOIN Locations l ON a.LocationID \= l.LocationID  
\-- Lấy thông tin nhà cung cấp từ đơn hàng gần nhất của tài sản này  
LEFT JOIN OrderDetails od ON a.AssetID \= od.AssetID  
LEFT JOIN PurchaseOrders po ON od.OrderID \= po.OrderID  
LEFT JOIN Suppliers s ON po.SupplierID \= s.SupplierID  
\-- Lấy thông tin người đang giữ tài sản  
LEFT JOIN AssignmentDetails ad ON a.AssetID \= ad.AssetID  
LEFT JOIN Assignments asgn ON ad.AssignmentID \= asgn.AssignmentID  
LEFT JOIN Users u\_staff ON asgn.StaffID \= u\_staff.UserID;  
